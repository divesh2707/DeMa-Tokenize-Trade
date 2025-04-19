import React, { useState, useEffect } from "react";
import "../styles/Home1.css";
import { useNavigate } from "react-router-dom";

const Home1 = ({ cnfts = [], loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && cnfts.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % cnfts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [cnfts, loading]);

  return (
    <div className="home1-container" onClick={()=>{navigate(`/${cnfts[currentIndex].contractAddress}/${cnfts[currentIndex].tokenId}`)}}>
      {loading?(
        <div className="home1-shimmer-card">
          <div className="home1-shimmer-line home1-shimmer-title" />
          <div className="home1-shimmer-line home1-shimmer-price" />
        </div>
      ):(
        cnfts.length > 0 && (
         <>
          <img src={cnfts[currentIndex].image} alt={cnfts[currentIndex].name} className="home1-nft-image" />
          <span className="home1-nft-name">{cnfts[currentIndex].name}</span>
          <span className="home1-nft-price">{cnfts[currentIndex].price} ETH</span>
         </>
        )
      )}
    </div>
  );
};

export default Home1;
