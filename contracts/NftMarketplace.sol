// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface INftTracking {
     enum Status { Created, InTransit, Delivered, Rejected, Cancelled, Finalized }
    function getLatestShipmentStatus(address nft, uint256 tokenId) external view returns (Status);
    function refundListingFeeToSeller(address seller, uint256 amount) external;
}

contract NftMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        bool isPhysical;
    }
    INftTracking public nftTracker;

    mapping(address => mapping(uint256 => Listing)) public listings;

    uint256 public marketplaceFeePercent = 250; // 2.5%
    address public feeRecipient;
    address public owner;

    event NFTListed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 price, bool isPhysical);
    event NFTSold(address indexed nft, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NFTListingCancelled(address indexed nft, uint256 indexed tokenId, address indexed seller);
    event ListingUpdated(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 newPrice, bool isPhysical);
    event MarketplaceFeeUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newRecipient);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

        constructor() {
        feeRecipient = msg.sender;
        owner = msg.sender;
    }

    // Allow owner to set the NftTracking contract address after deployment
    function setNftTrackerAddress(address _nftTracker) external onlyOwner {
        require(_nftTracker != address(0), "Invalid address");
        nftTracker = INftTracking(_nftTracker);
    }



    function setMarketplaceFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee too high (max 10%)");
        marketplaceFeePercent = newFeePercent;
        emit MarketplaceFeeUpdated(newFeePercent);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function listNFT(address nft, uint256 tokenId, uint256 price, bool isPhysical) external payable {
        require(price > 0, "Price must be greater than zero");
        IERC721 nftContract = IERC721(nft);
        require(nftContract.ownerOf(tokenId) == msg.sender, "You are not the current owner");
        require(nftContract.getApproved(tokenId) == address(this), "Marketplace not approved");

        try nftTracker.getLatestShipmentStatus(nft, tokenId) returns (INftTracking.Status status) {
           require(
                status == INftTracking.Status.Rejected || 
                status == INftTracking.Status.Cancelled || 
                status == INftTracking.Status.Finalized, 
                "NFT shipment not completed or closed"
            );

        } catch {
            // If there's no shipment, we assume it's a digital item and allow listing
        }
        

        listings[nft][tokenId] = Listing(msg.sender, price, isPhysical);
        emit NFTListed(nft, tokenId, msg.sender, price, isPhysical);

        if (isPhysical) {
        uint256 listingFee = (price * marketplaceFeePercent) / 10000;
        require(msg.value == listingFee, "Incorrect ETH amount for listing fee"); // Ensure the correct ETH amount is sent
        payable(address(nftTracker)).transfer(listingFee); // Deposit to tracking contract
    }

    }

    function buyNFT(address nft, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[nft][tokenId];
        require(listing.price > 0, "NFT not listed");
        require(msg.value == listing.price, "Incorrect ETH amount");

        delete listings[nft][tokenId];

        uint256 fee = (msg.value * marketplaceFeePercent) / 10000;
        uint256 sellerAmount = msg.value - fee;

        if (listing.isPhysical) {
        uint256 trackingAmount = (msg.value * 9750) / 10000; // 97.5% for Tracking contract
        uint256 feeAmount = (msg.value * 250) / 10000; // 2.5% marketplace fee

        // Deposit 97.5% into Tracking contract
        payable(address(nftTracker)).transfer(trackingAmount);

        // Pay 2.5% to Fee recipient
        payable(feeRecipient).transfer(feeAmount);

    } else {
        // If it's not a physical item, the process remains the same as before
        payable(listing.seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(fee);
    }

        IERC721(nft).safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit NFTSold(nft, tokenId, msg.sender, listing.price);
    }

    function cancelListing(address nft, uint256 tokenId) external {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller == msg.sender, "Not seller");

        delete listings[nft][tokenId];
        emit NFTListingCancelled(nft, tokenId, msg.sender);
        if (listing.isPhysical) {
        uint256 oldFee = (listing.price * marketplaceFeePercent) / 10000;
        // Call the tracking contract to refund the old fee to the seller
        nftTracker.refundListingFeeToSeller(listing.seller, oldFee);
    }
    }

    function updateListing(address nft, uint256 tokenId, uint256 newPrice, bool isPhysical) external payable {
        Listing storage listing = listings[nft][tokenId];
    require(listing.seller == msg.sender, "Not the seller");
    require(newPrice > 0, "Price must be greater than zero");

    // Refund old listing fee to seller (via nftTracker contract)
    if (listing.isPhysical) {
        uint256 oldFee = (listing.price * marketplaceFeePercent) / 10000;
        // Call the tracking contract to refund the old fee to the seller
        nftTracker.refundListingFeeToSeller(listing.seller, oldFee);
    }
         listing.price = newPrice;
    listing.isPhysical = isPhysical;

    // Deposit new listing fee for physical items
    if (isPhysical) {
        uint256 newFee = (newPrice * marketplaceFeePercent) / 10000;
        require(msg.value == newFee, "Incorrect ETH amount for listing fee"); // Ensure the correct ETH amount is sent
        payable(address(nftTracker)).transfer(newFee); // Deposit new fee to tracking contract
    }

    emit ListingUpdated(nft, tokenId, msg.sender, newPrice, isPhysical);
    }

    receive() external payable {
        revert("Direct transfers not allowed");
    }
}
