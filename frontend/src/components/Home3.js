import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home3.css";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Home3 = ({ nfts = [], loading }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      current.scrollLeft += direction === "left" ? -420 : 420;
    }
  };

  const renderPreview = (nft) => {
    if (!nft.mediaType) return <div className="loading-spinner" />;
    switch (nft.mediaType) {
      case "video":
        return <video src={nft.animation_url} preload="metadata" />;
      case "audio":
        return <img src={defaultAudioImg} alt={nft.name} />;
      case "file":
        return <img src={defaultFileImg} alt={nft.name} />;
      default:
        return <img src={nft.image} alt={nft.name} />;
    }
  };

  return (
    <>
    <h1 className="home2-heading"> <span style={{color:"orange"}}>Curated</span> NFT Collection</h1>
    <p className="home2-paragraph">A blend of real-world and virtual treasures.</p>
    <div className="home3-wrapper">
      <button className="carousel-button left" onClick={() => scroll("left")}>
        <FaChevronLeft />
      </button>
      <div className="home3-container" ref={scrollRef}>
      {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="home3-card home3-shimmer-card">
                <div className="home3-shimmer-image" />
                <div className="home3-shimmer-line home3-shimmer-title" />
                <div className="home3-shimmer-line home3-shimmer-description" />
                <div className="home3-shimmer-line home3-shimmer-price" />
                </div>
            ))
            ) : (
        nfts.map((token, index) => (
          <div
            key={index}
            className="home3-card"
            onClick={() => navigate(`/${token.contractAddress}/${token.tokenId}`)}
          >
            <div className="home3-card-image-container">
              {renderPreview(token)}
            </div>
            <div className="home3-card-content">
              <h3 className="home3-card-title">
                {token.name
                  ? `${token.name.slice(0, 20)}${token.name.length > 20 ? "..." : ""}`
                  : "Unnamed NFT"}
              </h3>
              <p className="home3-card-description">
                {token.description
                  ? `${token.description.slice(0, 50)}${token.description.length > 50 ? "..." : ""}`
                  : ""}
              </p>
              <p className="home3-card-price">{token.price} ETH</p>
            </div>
          </div>
        ))
    )}
      </div>
      <button className="carousel-button right" onClick={() => scroll("right")}>
        <FaChevronRight />
      </button>
    </div>
    </>
  );
};

export default Home3;
