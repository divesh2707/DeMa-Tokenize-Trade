// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftTracking is ReentrancyGuard {
    enum Status { Created, InTransit, Delivered, Rejected, Cancelled,Finalized }
    enum RejectionReason { Damaged, WrongItem, Other }

    address public owner;
    uint256 public shipmentCounter;
    uint256 public defaultDeadlineSeconds = 1800; // 30 minutes
    uint256 public defaultRejectionDeadlineSeconds = 300; // 5 minute
    uint256 public refundPercentage = 9875; // 98.75%
    uint256 public maxEntries = 5;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyBuyer(uint256 shipmentId) {
        require(msg.sender == shipments[shipmentId].buyer, "Not buyer");
        _;
    }

    modifier onlySeller(uint256 shipmentId) {
        require(msg.sender == shipments[shipmentId].seller, "Not seller");
        _;
    }

    modifier onlyAuthorizedThirdParty(uint256 shipmentId) {
        require(
            shipments[shipmentId].isAuthorizedThirdParty[msg.sender],
            "Not authorized third party"
        );
        _;
    }

    modifier onlyAuthorized(uint256 shipmentId) {
        Shipment storage s = shipments[shipmentId];
        require(
            msg.sender == s.seller ||
            msg.sender == s.buyer ||
            s.isAuthorizedThirdParty[msg.sender],
            "Not authorized"
        );
        _;
    }

    struct Shipment {
        address nft;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        Status status;
        bytes32[] locations;
        uint256[] timestamps;
        uint256 createdAt;
        uint256 deliveredAt;
        address[] authorizedThirdParties;
        mapping(address => bool) isAuthorizedThirdParty;
    }

    mapping(uint256 => Shipment) public shipments;
    mapping(address => mapping(uint256 => uint256[])) public nftToShipments;

    address public marketplaceContract;

    event ShipmentCreated(
        uint256 indexed shipmentId,
        address indexed nft,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        uint256 timestamp
    );

    event ShipmentUpdated(
        uint256 indexed shipmentId,
        Status status,
        uint256 timestamp,
        address indexed updater,
        string role
    );

    event ShipmentDelivered(
        uint256 indexed shipmentId,
        uint256 timestamp,
        address indexed updater,
        string role
    );

    event ShipmentRejected(
        uint256 indexed shipmentId,
        address indexed buyer,
        uint256 refundedAmount,
        RejectionReason reason,
        uint256 timestamp
    );

    event ShipmentCancelled(
        uint256 indexed shipmentId,
        address indexed seller,
        uint256 refundedAmount,
        uint256 timestamp
    );

    event ShipmentAutoCancelled(
        uint256 indexed shipmentId,
        address indexed sender,
        uint256 refundedAmount,
        uint256 timestamp
    );

    event finalizeShipment(uint256 indexed shipmentId, address indexed from);
    event DeliveryDeadlineUpdated(uint256 newSeconds);
    event RejectionDeadlineUpdated(uint256 newSeconds);
    event RefundPercentageUpdated(uint256 newPercentage);
    event MaxEntriesUpdated(uint256 newMax);

    event ThirdPartyAuthorized(uint256 indexed shipmentId, address indexed thirdParty, address indexed seller);
    event ThirdPartyRevoked(uint256 indexed shipmentId, address indexed thirdParty, address indexed seller);

    constructor(address _marketplaceContract) {
        owner = msg.sender;
        marketplaceContract = _marketplaceContract;
    }

    modifier onlyMarketplace() {
        require(msg.sender == marketplaceContract, "Only marketplace can call this");
        _;
    }

    function createShipment(address nft, address seller, uint256 tokenId, uint256 price) external {
        IERC721 nftContract = IERC721(nft);
        require(nftContract.ownerOf(tokenId) == msg.sender, "Only token owner can create shipment");

        shipmentCounter++;
        Shipment storage s = shipments[shipmentCounter];

        s.nft = nft;
        s.tokenId = tokenId;
        s.seller = seller;
        s.buyer = msg.sender;
        s.price = price;
        s.status = Status.Created;
        s.createdAt = block.timestamp;

        nftToShipments[nft][tokenId].push(shipmentCounter);

        emit ShipmentCreated(shipmentCounter, nft, tokenId, seller, msg.sender, price, block.timestamp);
    }

    function getLatestShipmentStatus(address nft, uint256 tokenId) external view returns (Status) {
        uint256[] storage shipmentsList = nftToShipments[nft][tokenId];
        require(shipmentsList.length > 0, "No shipment found");
        uint256 latestShipmentId = shipmentsList[shipmentsList.length - 1];
        return shipments[latestShipmentId].status;
    }

    function getAllShipmentsForNFT(address nft, uint256 tokenId) external view returns (uint256[] memory) {
        return nftToShipments[nft][tokenId];
    }

    function authorizeThirdParty(uint256 shipmentId, address thirdParty) external onlySeller(shipmentId) {
        Shipment storage s = shipments[shipmentId];
        require(!s.isAuthorizedThirdParty[thirdParty], "Already authorized");

        s.isAuthorizedThirdParty[thirdParty] = true;
        s.authorizedThirdParties.push(thirdParty);

        emit ThirdPartyAuthorized(shipmentId, thirdParty, s.seller);
    }

    function revokeThirdParty(uint256 shipmentId, address thirdParty) external onlySeller(shipmentId) {
        Shipment storage s = shipments[shipmentId];
        require(s.isAuthorizedThirdParty[thirdParty], "Not authorized");

        s.isAuthorizedThirdParty[thirdParty] = false;

        uint256 index = findThirdPartyIndex(s, thirdParty);
        if (index < s.authorizedThirdParties.length - 1) {
            s.authorizedThirdParties[index] = s.authorizedThirdParties[s.authorizedThirdParties.length - 1];
        }
        s.authorizedThirdParties.pop();

        emit ThirdPartyRevoked(shipmentId, thirdParty, s.seller);
    }

    function findThirdPartyIndex(Shipment storage s, address thirdParty) private view returns (uint256) {
        for (uint256 i = 0; i < s.authorizedThirdParties.length; i++) {
            if (s.authorizedThirdParties[i] == thirdParty) {
                return i;
            }
        }
        revert("Third party not found");
    }

    function updateShipment(uint256 shipmentId, bytes32 location) external nonReentrant {
        Shipment storage s = shipments[shipmentId];

        require(s.status != Status.Rejected && s.status != Status.Cancelled && s.status != Status.Delivered, "Shipment closed");
        require(msg.sender == s.seller || s.isAuthorizedThirdParty[msg.sender], "Unauthorized");

        require(s.locations.length < maxEntries && s.timestamps.length < maxEntries, "Max entries reached");

        s.status = Status.InTransit;
        s.locations.push(location);
        s.timestamps.push(block.timestamp);

        string memory role = msg.sender == s.seller ? "Seller" : "ThirdParty";
        emit ShipmentUpdated(shipmentId, Status.InTransit, block.timestamp, msg.sender, role);
    }

    function markAsDelivered(uint256 shipmentId) external {
        Shipment storage s = shipments[shipmentId];
        require(block.timestamp <= s.createdAt + defaultDeadlineSeconds, "Deadline passed");
        require(s.status != Status.Delivered, "Already delivered");
        require(msg.sender == s.seller || s.isAuthorizedThirdParty[msg.sender], "Unauthorized");

        s.status = Status.Delivered;
        s.deliveredAt = block.timestamp;

        string memory role = msg.sender == s.seller ? "Seller" : "ThirdParty";
        emit ShipmentDelivered(shipmentId, block.timestamp, msg.sender, role);
    }

    function rejectDelivery(uint256 shipmentId, RejectionReason reason) external onlyBuyer(shipmentId) nonReentrant {
        Shipment storage s = shipments[shipmentId];
        require(s.status == Status.Delivered, "Not delivered");
        require(block.timestamp <= s.deliveredAt + defaultRejectionDeadlineSeconds, "Rejection window expired");

        s.status = Status.Rejected;

        uint256 refundAmount = (s.price * refundPercentage) / 10000;
        uint256 sellerAmount = (s.price * 125) / 10000;

        payable(s.buyer).transfer(refundAmount);
        payable(s.seller).transfer(sellerAmount);

        IERC721(s.nft).transferFrom(s.buyer, s.seller, s.tokenId);

        emit ShipmentRejected(shipmentId, s.buyer, refundAmount, reason, block.timestamp);
    }

    function cancelShipmentBySeller(uint256 shipmentId) external onlySeller(shipmentId) nonReentrant {
        Shipment storage s = shipments[shipmentId];
        require(s.status != Status.Delivered && s.status != Status.Rejected && s.status != Status.Cancelled, "Cannot cancel");

        s.status = Status.Cancelled;

        payable(s.buyer).transfer(s.price);
        IERC721(s.nft).transferFrom(s.buyer, s.seller, s.tokenId);

        emit ShipmentCancelled(shipmentId, s.seller, s.price, block.timestamp);
    }

    function autoCancelIfLate(uint256 shipmentId) external {
        Shipment storage s = shipments[shipmentId];
        require(s.status == Status.Created || s.status == Status.InTransit, "Not eligible");
        require(block.timestamp > s.createdAt + defaultDeadlineSeconds, "Deadline not passed");

        s.status = Status.Cancelled;

        payable(s.buyer).transfer(s.price);
        IERC721(s.nft).transferFrom(s.buyer, s.seller, s.tokenId);

        emit ShipmentAutoCancelled(shipmentId, msg.sender, s.price, block.timestamp);
    }

    function finalizeDeliveredShipment(uint256 shipmentId) external nonReentrant {
        Shipment storage s = shipments[shipmentId];
        require(s.status == Status.Delivered, "Not delivered");
        require(block.timestamp > s.deliveredAt + defaultRejectionDeadlineSeconds, "Rejection window not passed");

        payable(s.seller).transfer(s.price);
         s.status = Status.Finalized;
        emit finalizeShipment(shipmentId, msg.sender);
    }

    function updateRefundPercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 10000, "Max 100%");
        refundPercentage = newPercentage;
        emit RefundPercentageUpdated(newPercentage);
    }

    function updateMaxEntries(uint256 newMax) external onlyOwner {
        require(newMax > 0 && newMax <= 10, "1-10 only");
        maxEntries = newMax;
        emit MaxEntriesUpdated(newMax);
    }

    function updateDeliveryDeadline(uint256 newDeadlineSeconds) external onlyOwner {
    require(newDeadlineSeconds > 0, "Deadline must be positive");
    defaultDeadlineSeconds = newDeadlineSeconds;
    emit DeliveryDeadlineUpdated(newDeadlineSeconds);
}

function updateRejectionDeadline(uint256 newRejectionDeadlineSeconds) external onlyOwner {
    require(newRejectionDeadlineSeconds > 0, "Deadline must be positive");
    defaultRejectionDeadlineSeconds = newRejectionDeadlineSeconds;
    emit RejectionDeadlineUpdated(newRejectionDeadlineSeconds);
}


    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    function getShipmentDetails(uint256 shipmentId) external view onlyAuthorized(shipmentId) returns (
        bytes32[] memory locations,
        uint256[] memory timestamps,
        address[] memory authorizedThirdParties
    ) {
        Shipment storage s = shipments[shipmentId];
        return (s.locations, s.timestamps, s.authorizedThirdParties);
    }

    function refundListingFeeToSeller(address seller, uint256 amount) external onlyMarketplace {
        require(seller != address(0), "Invalid address");
        payable(seller).transfer(amount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
