import Web3 from "web3";
import NftMint from "../contracts/NftMint.json";
import { MarketplaceContract } from "./contract";
import { MdOutlineSell } from "react-icons/md";
import { PiArrowBendDownRightFill } from "react-icons/pi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { fetchNFTMetadata } from "./NftMetadata";
import { FaEdit } from "react-icons/fa";

export const getBlockTimestamp = async (web3, blockNumber) => {
  const block = await web3.eth.getBlock(blockNumber);
  return block.timestamp;
};
export const getUserActivity = async (account, startBlock = 0) => {
  const web3 = new Web3(window.ethereum);
  const contractAddress = NftMint.networks[11155111].address;
  const NFTContract = new web3.eth.Contract(NftMint.abi, contractAddress);
  const fromBlock = startBlock;
  const toBlock = "latest";
  const events = [];

  // Transfers (Sent + Received)
  const sentTransfers = await NFTContract.getPastEvents("Transfer", {
    fromBlock,
    toBlock,
    filter: { from: account },
  });
  const receivedTransfers = await NFTContract.getPastEvents("Transfer", {
    fromBlock,
    toBlock,
    filter: { to: account },
  });
  const allTransfers = sentTransfers.concat(receivedTransfers);

  const transferMap = allTransfers.map(e => ({
    from: e.returnValues.from,
    to: e.returnValues.to,
    tokenId: e.returnValues.tokenId,
    txHash: e.transactionHash,
    blockNumber: e.blockNumber,
  }));

  // Mint + Transfer Events
  for (const e of allTransfers) {
    const isMint = e.returnValues.from === "0x0000000000000000000000000000000000000000";
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, contractAddress);
    events.push({
      icon: isMint ? <MdOutlineEnergySavingsLeaf size={22} /> : <PiArrowBendDownRightFill size={22} />,
      type: isMint ? "Mint" : "Transfer",
      from: e.returnValues.from,
      to: e.returnValues.to,
      tokenId: e.returnValues.tokenId,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata,
    });
  }

  // Listed NFTs
  const listed = await MarketplaceContract.getPastEvents("NFTListed", {
    fromBlock,
    toBlock,
    filter: { seller: account },
  });

  for (const e of listed) {
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft);
    events.push({
      icon: <MdOutlineSell size={22} />,
      type: "Listing",
      from: e.returnValues.seller,
      tokenId: e.returnValues.tokenId,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata,
    });
  }

    // Updated Listings
    const updatedListings = await MarketplaceContract.getPastEvents("ListingUpdated", {
      fromBlock,
      toBlock,
      filter: { seller: account },
    });
  
    for (const e of updatedListings) {
      const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft);
      events.push({
        icon: <FaEdit size={22}  />, // visually different from original listing
        type: "Update",
        from: e.returnValues.seller,
        tokenId: e.returnValues.tokenId,
        price: web3.utils.fromWei(e.returnValues.newPrice, "ether"),
        isPhysical: e.returnValues.isPhysical,
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        metadata,
      });
    }
  

  // Cancelled Listings
  const cancelled = await MarketplaceContract.getPastEvents("NFTListingCancelled", {
    fromBlock,
    toBlock,
    filter: { seller: account },
  });

  for (const e of cancelled) {
    const metadata = await fetchNFTMetadata(e.returnValues.tokenId, e.returnValues.nft);
    events.push({
      icon: <TbCancel size={22} color="white" />,
      type: "Cancel",
      from: e.returnValues.seller,
      tokenId: e.returnValues.tokenId,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata,
    });
  }

  // Sale Events (as seller)
  const soldMatches = await MarketplaceContract.getPastEvents("NFTSold", {
    fromBlock,
    toBlock,
    filter: {
      tokenId: [...sentTransfers.map(e => e.returnValues.tokenId)],
      buyer: [...sentTransfers.map(e => e.returnValues.to)],
      nft: [...sentTransfers.map(e => e.address)],
    },
  });

  for (const match of soldMatches) {
    const metadata = await fetchNFTMetadata(match.returnValues.tokenId, match.returnValues.nft);
    events.push({
      icon: <MdOutlineShoppingBag size={22} />,
      type: "Sale",
      from: account,
      to: match.returnValues.buyer,
      tokenId: match.returnValues.tokenId,
      price: web3.utils.fromWei(match.returnValues.price, "ether"),
      txHash: match.transactionHash,
      blockNumber: match.blockNumber,
      metadata,
    });
  }

  // Purchase Events (as buyer)
  const sold = await MarketplaceContract.getPastEvents("NFTSold", {
    fromBlock,
    toBlock,
    filter: { buyer: account },
  });

  for (const e of sold) {
    const tokenId = e.returnValues.tokenId;
    const buyer = e.returnValues.buyer;

    const matchingTransfer = transferMap.find(t =>
      t.txHash === e.transactionHash &&
      t.to.toLowerCase() === buyer.toLowerCase() &&
      t.from !== "0x0000000000000000000000000000000000000000"
    );

    const metadata = await fetchNFTMetadata(tokenId, e.returnValues.nft);
    events.push({
      icon: <HiOutlineShoppingCart size={22} />,
      type: "Purchase",
      from: matchingTransfer?.from || "",
      to: buyer,
      tokenId,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      metadata,
    });
  }

  // Add timestamps
  const blockNumbers = [...new Set(events.map(e => e.blockNumber))];
  const blockData = await Promise.all(blockNumbers.map(bn => web3.eth.getBlock(bn)));

  const blockTimestamps = blockData.reduce((acc, block) => {
    acc[block.number] = block.timestamp;
    return acc;
  }, {});

  for (const e of events) {
    e.timestamp = blockTimestamps[e.blockNumber];
  }

  return events.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
};
