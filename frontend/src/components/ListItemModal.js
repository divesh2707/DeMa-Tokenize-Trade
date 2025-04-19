import React, { useState, useEffect } from "react";
import "../styles/ListItemModal.css";
import { MarketplaceContract } from "../utils/contract";
import ERC721 from "../contracts/ERC721.json"
import NftMarketplace from "../contracts/NftMarketplace.json";
import { IoIosInformationCircle } from "react-icons/io";
import { MdSell } from "react-icons/md";
import web3 from "../utils/web3";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import axios from "axios";
import {  resolveIPFS } from "../utils/detectFileType";
import ErrorToast from "./ErrorToast";
import { useNavigate } from "react-router-dom";
import { TrackingContract } from "../utils/contract";

const MARKETPLACE_ADDRESS = NftMarketplace.networks[11155111].address;

const ListItemModal = ({ onClose, token }) => {
    const { name, animation_url } = token.metadata || {};
    const [price, setPrice] = useState("");
    const [fee, setFee] = useState("0");
    const [sellerReceives, setSellerReceives] = useState("0");
    const [marketFeePercent, setMarketFeePercent] = useState(2.5);
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fileType, setFileType] = useState("image");
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    const resolvedAnimation = resolveIPFS(animation_url);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };

    useEffect(() => {
        const fetchFeePercent = async () => {
            try {
                const result = await MarketplaceContract.methods.marketplaceFeePercent().call();
                setMarketFeePercent(result / 100);
            } catch (err) {
                console.error("Failed to fetch fee percent:", err);
            }
        };
        fetchFeePercent();
    }, []);

    useEffect(() => {
        if (!price || isNaN(price)) {
            setFee("0");
            setSellerReceives("0");
            return;
        }

        const numericPrice = parseFloat(price);
        const feeAmount = (numericPrice * marketFeePercent) / 100;
        const finalAmount = numericPrice - feeAmount;

        setFee(feeAmount.toFixed(6));
        setSellerReceives(finalAmount.toFixed(6));
    }, [price]);

    useEffect(() => {
        const checkType = async () => {
          const urlToCheck =  animation_url || "image";
          const res = await axios.get(`http://localhost:5000/api/filetype/detect`, {
            params: { url: urlToCheck }
          });
          setFileType(res.data.type);
        };
    
        checkType();
      }, [resolvedAnimation]);
    
      const renderPreview = () => {
        if (fileType === null) {
          return <div className="loading-spinner" />; // Add some CSS or spinner here
        }
        if (fileType === "video") {
          return <video src={resolvedAnimation} controls preload="metadata" width="100%" />;
        } else if (fileType === "audio") {
          return <img src={defaultAudioImg} alt="Audio NFT" style={{objectFit:"cover"}}/>;
        } else if (fileType === "file") {
          return <img src={defaultFileImg} alt="File NFT" style={{objectFit:"cover"}}/>;
        } else {
          return <img src={token.image} alt={name} />;
        }
      };

      const handleListing = async () => {
        setLoading(true);
    
        const numericPrice = parseFloat(price);
        if (!price || numericPrice === 0) {
            setError("Price must be greater than 0");
            setShowToast(true);
            setLoading(false);
            return;
        }
    
        try {
            const priceInWei = web3.utils.toWei(price.toString(), "ether");
            const nftContract = new web3.eth.Contract(ERC721.abi, token.contractAddress);
            const user = localStorage.getItem("dema_wallet");
            const isPhysical = token.metadata.attributes[0].value === "Physical";
    
            // If it's a physical item, validate shipment status
            if (isPhysical) {
                try {
                    const status = await TrackingContract.methods
                        .getLatestShipmentStatus(token.contractAddress, token.tokenId)
                        .call({ from: user });
                
                    if (parseInt(status) != 3 && parseInt(status) != 4 && parseInt(status) != 5) {
                        setError("Listing denied: Shipment not yet Closed.");
                        setShowToast(true);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // No shipment exists — assume it's okay to proceed (likely first listing)
                    console.warn("No shipment found, assuming it's a first-time listing.");
                }
            }
    
            await nftContract.methods.approve(MARKETPLACE_ADDRESS, token.tokenId).send({ from: user });
    
            let listingFee = "0";
            if (isPhysical) {
                const feePercent = 250;
                listingFee = web3.utils.toWei(((numericPrice * feePercent) / 10000).toString(), "ether");
            }
            await MarketplaceContract.methods
                .listNFT(token.contractAddress, token.tokenId, priceInWei, isPhysical)
                .send({ from: user, value: listingFee });
    
            setLoading(false);
            handleClose();
            window.location.reload();
    
        } catch (error) {
            console.error("Listing error:", error);
            setError("Something went wrong!");
            setShowToast(true);
            setLoading(false);
        }
    };
    
    return (
        <div className="list-item-modal-overlay" onClick={handleClose}>
            <div className={`list-item-modal-container ${isClosing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button className="list-item-modal-close-button" onClick={handleClose}>
                    &times;
                </button>
                <div>{renderPreview()}</div>
                <div className="list-item-modal-info">
                    <h1><MdSell size={30}/>List Your Item</h1>
                    {token.metadata.attributes[0].value === "Physical" && 
                    <div className="list-item-modal-physical"><p><IoIosInformationCircle color="grey" size={24}/></p>
                        <p>For physical products, a platform fee must be paid upfront in case of rejection or cancellation.</p>
                    </div>}
                    <p className="list-item-modal-info-p1">{name}</p>
                    <p style={{ marginBottom: "25px" }}>
                        <span style={{ color: "#888", marginRight: "20px" }}>LISTED AT </span>
                        <input type="text" value={price} placeholder="Enter the Value" onChange={(e) => setPrice(e.target.value)} />ETH
                    </p>
                    <p className="list-item-modal-info-p2">Platform fees <span style={{ color: "white" }}>{fee} ETH</span></p>
                    <p className="list-item-modal-info-p2">Total est. proceeds <span style={{ color: "white" }}>{sellerReceives} ETH</span></p>

                    <button className="list-button" onClick={handleListing} disabled={loading}>
                        {!loading ? "List Item" : "Listing..."}
                    </button>
                </div>
            </div>
            {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default ListItemModal;
