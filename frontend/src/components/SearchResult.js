import React from "react";
import { BiSolidMessageError } from "react-icons/bi";
import "../styles/SearchResult.css";
import { useNavigate } from "react-router-dom";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";

const SearchResult=({fnfts, searchQuery})=>{
    const navigate = useNavigate();
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
    return(
        <>
         <h1 className="home2-heading"> <span style={{color:"orange"}}>Discoveries</span> for “{searchQuery}”</h1>
         <div className="home2-carousel-wrapper">
               <div className="home2-container" style={{flexWrap:"wrap", rowGap:"15px", columnGap:"15px"}}>
                {fnfts.length>0?
                 fnfts.map((d, index) => (
                         <div key={index} className="home2-card" onClick={() => navigate(`/${d.contractAddress}/${d.tokenId}`)}>
                         {renderPreview(d)}
                         <p className="home2-name">{d.name}</p>
                         <p className="home2-price">{d.price} ETH</p>
                         </div>
                     )):(
                        <div className="nothing-search">
                            <BiSolidMessageError size={90} color="whie"/>
                            <div>
                                <h1 className="nothing-search-heading"> <span style={{color:"orange"}}>Sorry</span> Nothing There !</h1>
                                <p className="nothing-search-para">You can explore downwards</p>
                            </div>
                        </div>
                     )}
               </div>
             </div>
        </>
    );
};

export default SearchResult;