import React, { useEffect, useState } from "react";
import web3 from "../utils/web3";
import "../styles/ProfileItemCard.css";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import axios from "axios";
import {  resolveIPFS } from "../utils/detectFileType";
import { useNavigate } from "react-router-dom";

const ProfileItemCard = ({ token, setShowItemModal, setListItemInfo, account, 
  setcancelItemInfo, setShowCancelModal,setShowBuyModal, setBuyItemInfo }) => {
  const { name, description, animation_url } = token.metadata || {};
  const isListed = !!token.listing;
  const navigate = useNavigate();
  const [fileType, setFileType] = useState(null);
  const isOwner = account?.toLowerCase() === localStorage.getItem("dema_wallet")?.toLowerCase();
  const isBuyer = isListed && !isOwner;
    const isPhysical = token?.metadata.attributes[0].value==="Physical";
  const resolvedAnimation = resolveIPFS(animation_url);

  useEffect(() => {
    const checkType = async () => {
      const urlToCheck =  animation_url || "image";
      const res = await axios.get(`http://localhost:5000/api/filetype/detect`, {
        params: { url: urlToCheck }
      });
      setFileType(res.data.type);
    };

    checkType();
  }, []);

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

  return (
    <div className={`profile-item-card ${!isListed ? "profile-item-card-not-listed" : ""}`} 
      onClick={()=>{navigate(`/${token.contractAddress}/${parseInt(token.tokenId).toString()}`)}}>
      <div className="profile-item-card-image-container">{renderPreview()}</div>
      <div className="profile-item-card-content">
        <h3 className="profile-item-card-title">{name ? `${name.slice(0, 20)}${name.length > 20 ? "..." : ""}` : "Unnamed NFT"}</h3>
        <p className="profile-item-card-description">
          {description?.slice(0, 50) || ""}
          {description?.length > 50 && "..."}
        </p>
        {isListed ? (
          <p className="profile-item-card-price">
            {web3.utils.fromWei(token.listing.price.toString(), "ether")} ETH
          </p>
        ) : (
          <p className="profile-item-card-listing">Not listed</p>
        )}
      </div>
      {isOwner && (
        <div className="profile-item-card-slide-up-button">
          {!isListed ? (
            <button
              className="profile-item-card-list-nft-button"
              onClick={(e) => {
                e.stopPropagation();
                setListItemInfo(token);
                setShowItemModal(true);
              }}
            >
              List NFT
            </button>
          ) : (
            <button
              className="profile-item-card-cancel-nft-button"
              onClick={(e) => {
                e.stopPropagation();
                setcancelItemInfo({tokenid: token.tokenId, contractAddress: token.contractAddress});
                setShowCancelModal(true);
              }}
            >
              Cancel Listing
            </button>
          )}
        </div>
      )}
      {isBuyer && (
        <div className="profile-item-card-slide-up-button">
          <button
            className="profile-item-card-buy-nft-button"
            onClick={(e) => {
              e.stopPropagation();
              setBuyItemInfo({tokenid: token.tokenId, contractAddress: token.contractAddress, price: token.listing.price.toString(), 
                isPhysical: isPhysical});
              setShowBuyModal(true);
            }}
          >
            Buy NFT
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileItemCard;
