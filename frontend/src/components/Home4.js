import React from "react";
import "../styles/Home4.css"
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import { useNavigate } from "react-router-dom";

const Home4=({pnfts, loading})=>{
    const navigate = useNavigate();

       const renderPreview = (d) => {
          if (d.mediaType === null) {
            return <div className="loading-spinner" />; // Add some CSS or spinner here
          }
          if (d.mediaType === "video") {
            return <video src={d.animation_url} alt={d.name}  preload="metadata"  />;
          } else if (d.mediaType === "audio") {
            return <img src={defaultAudioImg} alt={d.name} style={{objectFit:"cover"}}/>;
          } else if (d.mediaType === "file") {
            return <img src={defaultFileImg} alt={d.name} style={{objectFit:"cover"}}/>;
          } else {
            return <img src={d.image} alt={d.name}/>;
          }
        };

    return(
        <>
        <h1 className="home2-heading"> <span style={{color:"orange"}}>Tokenized</span> Tangibles</h1>
        <p className="home2-paragraph">From art to fashion—own the physical form.</p>
        <div className="home4-container">
        {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`home4-grid-${index} home4-shimmer-card`}>
                    <div className="home4-shimmer-line home4-shimmer-title" />
                    <div className="home4-shimmer-line home4-shimmer-price" />
                </div>
            ))
            ) : (
            pnfts.map((d, index)=>{
                return(
                    <div key={index} className={`home4-grid-${index}`}  onClick={() => navigate(`/${d.contractAddress}/${d.tokenId}`)}>
                        {renderPreview(d)}
                        <p className="home4-name">{d.name}</p>
                        <p className="home4-price">{d.price} ETH</p>
                    </div>
                )
            }))}
        </div>
        </>
    );
};

export default Home4;