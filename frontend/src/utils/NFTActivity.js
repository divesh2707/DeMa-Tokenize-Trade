import Web3 from "web3";
import { MarketplaceContract } from "./contract";
import ERC721 from "../contracts/ERC721.json";
import { MdOutlineSell } from "react-icons/md";
import { PiArrowBendDownRightFill } from "react-icons/pi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export const getBlockTimestamp = async (web3, blockNumber) => {
  const block = await web3.eth.getBlock(blockNumber);
  return block.timestamp;
};

const getPaginatedEvents = async (contract, eventName, options, chunkSize = 20000) => {
  const web3 = new Web3(window.ethereum);
  const latestBlock = await web3.eth.getBlockNumber();
  const fromBlock = options.fromBlock || 0;
  const toBlock = options.toBlock === "latest" ? latestBlock : options.toBlock;

  const allEvents = [];
  for (let start = fromBlock; start <= toBlock; start += chunkSize + 1) {
    const end = Math.min(start + chunkSize, parseInt(toBlock));
    try {
      const chunk = await contract.getPastEvents(eventName, {
        ...options,
        fromBlock: start,
        toBlock: end,
      });
      allEvents.push(...chunk);
    } catch (err) {
      console.warn(`Error in ${eventName} from ${start} to ${end}:`, err.message);
    }
  }

  return allEvents;
};

export const getActivitiesForToken = async (nftAddress, tokenIds, startBlock) => {
  const web3 = new Web3(window.ethereum);
  const NFTContract = new web3.eth.Contract(ERC721.abi, nftAddress);
  const events = [];

  const fromBlock = startBlock;
  const toBlock = "latest";
  const tokenId = tokenIds ? tokenIds : 0;
  const tokenIdStr = tokenId.toString();

  // 🔁 Transfer Events (Minted + Transferred)
  const transfers = await getPaginatedEvents(NFTContract, "Transfer", {
    fromBlock,
    toBlock,
    filter: { tokenId },
  });

  for (const e of transfers) {
    const isMint = e.returnValues.from === "0x0000000000000000000000000000000000000000";
    events.push({
      icon: isMint ? <MdOutlineEnergySavingsLeaf size={22} /> : <PiArrowBendDownRightFill size={22} />,
      type: isMint ? "Mint" : "Transfer",
      from: e.returnValues.from,
      to: e.returnValues.to,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      timestamp: await getBlockTimestamp(web3, e.blockNumber),
    });
  }

  // 📦 Listed Events
  const listed = await getPaginatedEvents(MarketplaceContract, "NFTListed", {
    fromBlock,
    toBlock,
    filter: {
      nft: nftAddress,
      tokenId: tokenIdStr,
    },
  });

  for (const e of listed) {
    events.push({
      icon: <MdOutlineSell size={22} />,
      type: "Listing",
      from: e.returnValues.seller,
      to: null,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      timestamp: await getBlockTimestamp(web3, e.blockNumber),
    });
  }

    // ✏️ Updated Listings
    const updated = await getPaginatedEvents(MarketplaceContract, "ListingUpdated", {
      fromBlock,
      toBlock,
      filter: {
        nft: nftAddress,
        tokenId: tokenIdStr,
      },
    });
  
    for (const e of updated) {
      events.push({
        icon: <FaEdit size={22}  />, // distinct color to differentiate from listing
        type: "Update",
        from: e.returnValues.seller,
        to: null,
        price: web3.utils.fromWei(e.returnValues.newPrice, "ether"),
        isPhysical: e.returnValues.isPhysical,
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        timestamp: await getBlockTimestamp(web3, e.blockNumber),
      });
    }
  

  // ❌ Cancelled Events
  const cancelled = await getPaginatedEvents(MarketplaceContract, "NFTListingCancelled", {
    fromBlock,
    toBlock,
    filter: {
      nft: nftAddress,
      tokenId: tokenIdStr,
    },
  });

  for (const e of cancelled) {
    events.push({
      icon: <TbCancel size={22} color="white" />,
      type: "Cancel",
      from: e.returnValues.seller,
      to: null,
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      timestamp: await getBlockTimestamp(web3, e.blockNumber),
    });
  }

  // 💰 Sold Events
  const sold = await getPaginatedEvents(MarketplaceContract, "NFTSold", {
    fromBlock,
    toBlock,
    filter: {
      nft: nftAddress,
      tokenId: tokenIdStr,
    },
  });

  for (const e of sold) {
    const relatedTransfer = transfers.find(t => t.transactionHash === e.transactionHash);
    const seller = relatedTransfer?.returnValues?.from || null;

    events.push({
      icon: <MdOutlineShoppingBag size={22} />,
      type: "Sale",
      from: seller,
      to: e.returnValues.buyer,
      price: web3.utils.fromWei(e.returnValues.price, "ether"),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      timestamp: await getBlockTimestamp(web3, e.blockNumber),
    });
  }

  // 📅 Sort by latest first
  events.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

  return events;
};
