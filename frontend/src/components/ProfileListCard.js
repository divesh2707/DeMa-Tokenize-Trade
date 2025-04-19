import React, {useState, useEffect} from "react";
import web3 from "../utils/web3";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import axios from "axios";
import {  resolveIPFS } from "../utils/detectFileType";
import "../styles/ListItemCard.css"
import { useNavigate } from "react-router-dom";

const ProfileListCard=({token, account, setShowCancelModal, setcancelItemInfo, setShowBuyModal, setBuyItemInfo})=>{
    const { name, description, animation_url, image } = token.metadata || {};
    const navigate = useNavigate();
    const [fileType, setFileType] = useState("image");
    const isPhysical = token.metadata.attributes[0].value==="Physical";
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
            return <img src={image} alt={name} />;
          }
        };

    return(
        <div className="profile-list-card" onClick={()=>{navigate(`/${token.nftAddress}/${token.tokenId}`)}}>
            <div className="profile-list-card-image-container">{renderPreview()}</div>
            <div className="profile-list-card-content">
                <h3 className="profile-list-card-title">{name ? `${name.slice(0, 20)}${name.length > 20 ? "..." : ""}` : "Unnamed NFT"}</h3>
                <p className="profile-list-card-description">
                {description?.slice(0, 50) || ""}
                {description?.length > 50 && "..."}
                </p>
                <p className="profile-list-card-price">
                    {web3.utils.fromWei(token.price.toString(), "ether")} ETH
                </p>
            </div>
            {account===localStorage.getItem("dema_wallet")? (
                <div className="profile-list-card-slide-up-button">
                <button
                    className="profile-list-card-list-nft-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowCancelModal(true);
                        setcancelItemInfo({tokenid: token.tokenId, contractAddress: token.nftAddress});
                    }}
                >
                    Cancel Listing
                </button>
                </div>
            ):(
                <div className="profile-list-card-slide-up-button">
                <button
                    className="profile-list-card-list-nft-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowBuyModal(true);
                        setBuyItemInfo({tokenid: token.tokenId, contractAddress: token.nftAddress, price: token.price.toString(), isPhysical: isPhysical});
                    }}
                    style={{backgroundColor:"#118c01"}}
                >
                    Buy NFT
                </button>
                </div>
            )}
        </div>
    );
};

export default ProfileListCard;