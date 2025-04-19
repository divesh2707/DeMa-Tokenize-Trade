// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftMint is ERC721URIStorage {
    uint256 private _tokenIds;

    struct NFTInfo {
        address creator;
        uint256 timestamp;
    }

    mapping(uint256 => NFTInfo) public nftDetails;

    constructor() ERC721("DeMaNFT", "DMT") {}

    function mintNFT(string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        nftDetails[newItemId] = NFTInfo({
            creator: msg.sender,
            timestamp: block.timestamp
        });

        return newItemId;
    }

    function getNFTInfo(uint256 tokenId) public view returns (address creator, uint256 timestamp) {
        NFTInfo memory info = nftDetails[tokenId];
        return (info.creator, info.timestamp);
    }
}
