import React, { useRef } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import "../styles/Home2.css";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import { useNavigate } from "react-router-dom";

const Home2 = ({ dnfts, loading }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === "left") {
      current.scrollLeft -= 420;
    } else {
      current.scrollLeft += 420;
    }
  };

  const renderPreview = (d) => {
    if (d.mediaType === null) {
      return <div className="loading-spinner" />;
    }
    if (d.mediaType === "video") {
      return <video src={d.animation_url} alt={d.name}  preload="metadata" />;
    } else if (d.mediaType === "audio") {
      return <img src={defaultAudioImg} alt={d.name} />;
    } else if (d.mediaType === "file") {
      return <img src={defaultFileImg} alt={d.name} />;
    } else {
      return <img src={d.image} alt={d.name} />;
    }
  };

  return (
    <>
    <h1 className="home2-heading"> <span style={{color:"orange"}}>Spotlight</span> on Digital Gems</h1>
    <p className="home2-paragraph">Unique NFTs making noise across the blockchain.</p>
    <div className="home2-carousel-wrapper">
      <button className="carousel-button left" onClick={() => scroll("left")}><FaChevronLeft /></button>
      
      <div className="home2-container" ref={scrollRef} >
        {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="home2-card home2-shimmer-card">
                <div className="home2-shimmer-image" />
                <div className="home2-shimmer-line home2-shimmer-title" />
                <div className="home2-shimmer-line home2-shimmer-price" />
                </div>
            ))
            ) : (
            dnfts.map((d, index) => (
                <div key={index} className="home2-card" onClick={() => navigate(`/${d.contractAddress}/${d.tokenId}`)}>
                {renderPreview(d)}
                <p className="home2-name">{d.name}</p>
                <p className="home2-price">{d.price} ETH</p>
                </div>
            ))
            )}
      </div>
      <button className="carousel-button right" onClick={() => scroll("right")}><FaChevronRight /></button>
    </div>
    </>
  );
};

export default Home2;
