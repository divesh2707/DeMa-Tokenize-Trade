import React, { useEffect, useState } from "react";
import { MarketplaceContract } from "../utils/contract.js";
import web3 from "../utils/web3.js";

const NftDetailContentButton = ({ nft, setPrice2, setShowBuyModal, setShowItemModal, setShowCancelModal, setShowUpdateModal }) => {
  const [buttonType, setButtonType] = useState("");
  const [price, setPrice] = useState(null);
  const user = localStorage.getItem("dema_wallet");
  const owner = nft.owner;

  useEffect(() => {
    const fetchListingStatus = async () => {
      try {
        const listing = await MarketplaceContract.methods
          .listings(nft.contractAddress, nft.tokenId)
          .call();

        const isListed = listing && listing.seller !== "0x0000000000000000000000000000000000000000";
        if (isListed) {
          setPrice(listing.price);
          setPrice2(listing.price);
        }

       const ownerCheck = owner.toLowerCase()===user.toLowerCase();
        if (isListed && !ownerCheck) setButtonType("Buy");
        else if (isListed && ownerCheck) setButtonType("Update");
        else if (!isListed && ownerCheck) setButtonType("List");
        else setButtonType(""); // Not listed and not owned by user
      } catch (error) {
        console.error("Error fetching listing status:", error);
      }
    };

    fetchListingStatus();
  }, [nft, owner, user]);

  return (
    <>
      {buttonType === "Buy" && (
        <>
          <p className="nft-detail-button-buy-for">BUY FOR</p>
          <div className="nft-detail-button-buy-price">
            <h1>{web3.utils.fromWei(price?.toString() || "0", "ether")}</h1>
            <h1>ETH</h1>
          </div>
          <button className="nft-detail-buttonss" style={{backgroundColor:"#118c01"}} onClick={()=>{setShowBuyModal(true);}}>BUY NOW</button>
          <hr style={{color:"#999"}}/>
        </>
      )}
      {buttonType === "Update" && (
        <>
            <p className="nft-detail-button-buy-for">SALE CONTROLS</p>
            <div className="nft-detail-buttonss2">
                <button className="nft-detail-buttonss1" style={{backgroundColor:"#0066ff"}} onClick={()=>{setShowUpdateModal(true);}}>UPDATE LISTING</button>
                <button className="nft-detail-buttonss1" style={{backgroundColor:"#ff3b3b"}} onClick={()=>{setShowCancelModal(true);}}>CANCEL LISTING</button>
            </div>
            <hr style={{color:"#999"}}/>
        </>)}
      {buttonType === "List" && (
        <>
            <p className="nft-detail-button-buy-for">LAUNCH ON MARKET</p>
            <button className="nft-detail-buttonss" style={{backgroundColor:"#0066ff"}} onClick={()=>{setShowItemModal(true);}}>LIST NFT</button>
            <hr style={{color:"#999"}}/>
        </>
      )}
      
    </>
  );
};

export default NftDetailContentButton;
