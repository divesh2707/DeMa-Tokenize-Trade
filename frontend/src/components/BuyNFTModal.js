import React, { useState } from "react";
import { MarketplaceContract } from "../utils/contract";
import ErrorToast from "./ErrorToast";
import { useNavigate } from "react-router-dom";
import NftTracking from "../contracts/NftTracking.json";
import { TrackingContract } from "../utils/contract";
import ERC721 from "../contracts/ERC721.json";
import web3 from "../utils/web3";
import axios from "axios";
import "../styles/BuyNftModal.css"

const BuyNFTModal = ({ onClose, token }) => {
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const navigate = useNavigate();

  const handleBuy = async () => {
    if (token.isPhysical && !shippingAddress.trim()) {
      setError("Please enter your shipping address.");
      setShowToast(true);
      return;
    }

    setLoading(true);
    const buyer = localStorage.getItem("dema_wallet");
    const NFTContract = new web3.eth.Contract(ERC721.abi, token.contractAddress);
    


    try {
      const owner = await NFTContract.methods.ownerOf(token.tokenid).call();
  // Buy NFT
      await MarketplaceContract.methods
        .buyNFT(token.contractAddress, token.tokenid)
        .send({ from: buyer, value: token.price });

        if (token.isPhysical) {
          // Create shipment on-chain
          await NFTContract.methods
        .approve(NftTracking.networks[11155111].address, token.tokenid)
        .send({ from: buyer });


          const tx = await TrackingContract.methods
            .createShipment(token.contractAddress, owner, token.tokenid, token.price)
            .send({ from: buyer });

            const shipmentEvent = tx.events?.ShipmentCreated;
            if (shipmentEvent && shipmentEvent.returnValues) {
              const shipmentId = parseInt(shipmentEvent.returnValues.shipmentId);
              const tokenIdDecimal = parseInt(token.tokenid);
        
        await axios.post("http://localhost:5000/api/address/save", {
          shipmentId,
          buyerAddress: buyer,
          sellerAddress: owner,
          nftAddress: token.contractAddress,
          tokenId: tokenIdDecimal,
          shippingAddress,
        });
      }else {
        throw new Error("ShipmentCreated event not found");
      }
    }

      setLoading(false);
      onClose();
      navigate(`/${buyer}`);
      window.location.reload();

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(`Buy Failed: ${err?.message || "Unknown error"}`);
      setShowToast(true);
    }
  };

  const formattedPrice = web3.utils.fromWei(token.price, "ether");

  return (
    <div className="buy-nft-modal-overlay" onClick={onClose}>
      <div className="buy-nft-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1>Confirm Purchase</h1>
        <p style={{ marginTop: "5px", display: "block", color:"#ccc", fontSize:"14px", marginBottom:"0" }}>
          You are about to purchase this NFT for
          <strong> {formattedPrice} ETH</strong>.
        </p>

        {token.isPhysical && (
          <>
            <p style={{ marginTop: "10px", display: "block", color:"#ccc", fontSize:"14px", marginBottom:"0" }}>
            For physical assets, we need your full shipping address. It’s stored off-chain to protect your privacy.
            </p>
            <p style={{ marginTop: "10px", display: "block", color:"#ccc", fontSize:"14px", marginBottom:"7px" }}>
              You have to sign 3 transactions: 
            <br/>
            <strong>BUY NFT | APPROVE NFT | CREATE SHIPMENT</strong>
            </p >
            <textarea
                rows="3"
                placeholder="Your shipping address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="nft-buy-textarea"
                />
          </>
        )}

        <div className="buy-nft-modal-buttons" style={{ marginTop: "1rem" }}>
          <button
            className="buy-nft-modal-cancel-button"
            style={{ backgroundColor: "#ff3b3b", outline: "none", border: "none" }}
            onClick={onClose}
          >
            No, Cancel
          </button>
          <button
            className="buy-nft-modal-confirm-button"
            style={{ backgroundColor: "#118c01" }}
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? "Processing..." : `Confirm`}
          </button>
        </div>
      </div>
      {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default BuyNFTModal;
