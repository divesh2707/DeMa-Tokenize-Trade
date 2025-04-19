import Web3 from "web3";
import NftMint from "../contracts/NftMint.json";
import { MarketplaceContract } from "./contract";
import { MdOutlineSell } from "react-icons/md";
import { PiArrowBendDownRightFill } from "react-icons/pi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { fetchNFTMetadata } from "./NftMetadata";
import { FaEdit } from "react-icons/fa";

// Function to fetch block timestamp
export const getBlockTimestamp = async (web3, blockNumber) => {
  const block = await web3.eth.getBlock(blockNumber);
  return block.timestamp;
};

// Fetch user activity and metadata
export const getUserActivity = async (startBlock = 0) => {
  const web3 = new Web3(window.ethereum);
  const  contractAddress= NftMint.networks[11155111].address;
  const NFTContract = new web3.eth.Contract(NftMint.abi, NftMint.networks[11155111].address);
  const events = [];
  const fromBlock = startBlock;
  const toBlock = "latest";

  const Transfers = await NFTContract.getPastEvents("Transfer", {
    fromBlock,
    toBlock,
  });
  
  // Store all transfer events in a map for easier matching later
  const transferMap = Transfers.map(e => ({
    from: e.returnValues.from,
    to: e.returnValues.to,
    tokenId: e.returnValues.tokenId,
    txHash: e.transactionHash,
    blockNumber: e.blockNumber,
  }));

  // Add Mint + Transfer Events
  for (let e of Transfers) {
    const isMint = e.returnValues.from === "0x0000000000000000000000000000000000000000";
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, contractAddress); // Fetch metadata for each event
    events.push({
      icon: isMint ? <MdOutlineEnergySavingsLeaf size={22} /> : <PiArrowBendDownRightFill size={22} />,
      type: isMint ? "Mint" : "Transfer",
      from: e.returnValues.from,
      to: e.returnValues.to,
      tokenId: e.returnValues.tokenId,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata, // Include metadata
    });
  }

  // Listed Events
  const listed = await MarketplaceContract.getPastEvents("NFTListed", {
    fromBlock,
    toBlock,
  });

  for (let e of listed) {
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft); // Fetch metadata for each event
    events.push({
      icon: <MdOutlineSell size={22} />,
      type: "Listing",
      from: e.returnValues.seller,
      tokenId: e.returnValues.tokenId,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata, // Include metadata
    });
  }


    // Updated Listings
    const updated = await MarketplaceContract.getPastEvents("ListingUpdated", {
      fromBlock,
      toBlock,
    });
  
    for (let e of updated) {
      const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft); // Fetch metadata for each event
      events.push({
        icon: <FaEdit size={22} />, // Differentiated icon style
        type: "Update",
        from: e.returnValues.seller,
        tokenId: e.returnValues.tokenId,
        price: web3.utils.fromWei(e.returnValues.newPrice, "ether"),
        isPhysical: e.returnValues.isPhysical,
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        metadata, // Include metadata
      });
    }

    
  // Cancelled Listings
  const cancelled = await MarketplaceContract.getPastEvents("NFTListingCancelled", {
    fromBlock,
    toBlock,
  });

  for (let e of cancelled) {
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft); // Fetch metadata for each event
    events.push({
      icon: <TbCancel size={22} color="white" />,
      type: "Cancel",
      from: e.returnValues.seller,
      tokenId: e.returnValues.tokenId,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata, // Include metadata
    });
  }

  // Sold Events
  const sold = await MarketplaceContract.getPastEvents("NFTSold", {
    fromBlock,
    toBlock,
  });

  for (let e of sold) {
    const tokenId = e.returnValues.tokenId;

    // Try to find a matching transfer to get from
    const matchingTransfer = transferMap.find(t =>
      t.txHash === e.transactionHash &&
      t.from !== "0x0000000000000000000000000000000000000000"
    );

    const metadata = await fetchNFTMetadata(tokenId, e.returnValues.nft); // Fetch metadata for each event
    events.push({
      icon: <MdOutlineShoppingBag size={22} />,
      type: "Sale",
      from: matchingTransfer?.from || "",
      to: matchingTransfer?.to || "",
      tokenId,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata, // Include metadata
    });
  }

  // Add timestamps to each event
  const blockNumbers = [...new Set(events.map(e => e.blockNumber))];
  const blockData = await Promise.all(blockNumbers.map(bn => web3.eth.getBlock(bn)));

  const blockTimestamps = blockData.reduce((acc, block) => {
    acc[block.number] = block.timestamp;
    return acc;
  }, {});

  events.forEach(e => {
    e.timestamp = blockTimestamps[e.blockNumber];
  });

  // Sort by newest first
  return events.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
};
