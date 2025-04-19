import React from "react";
import defaultFileImg from "../images/file-management.webp";
import defaultAudioImg from "../images/gettyimages-1467667303-640x640.jpg";
import { FaHandPointer } from "react-icons/fa";
import MediaPlaceholder from "./MediaPlaceholder";


const NftDetailMedia = ({ image, animation_url, type, name}) => {
    const renderPreview = () => {
        if (!type) return <MediaPlaceholder />;

        switch (type) {
            case "video":
                return <video src={animation_url} controls width="100%" />;
            case "audio":
                return (
                    <div className="audio-preview-container">
                        <img src={defaultAudioImg} alt={name} className="audio-preview-image" />
                        <audio
                            controls
                            src={animation_url}
                            className="audio-overlay-controls"
                            controlsList="nodownload noplaybackrate"
                            preload="metadata"
                        />
                    </div>
                );
            case "file":
                return (
                    <div >
                        <a href={animation_url} target="_blank" rel="noopener noreferrer">
                            <img src={defaultFileImg} alt="File NFT" />
                        </a>
                        <p style={{color:"white", textAlign:"center", marginTop:"20px", display:"flex", alignItems:"center", 
                                justifyContent:"center", gap:"7px", fontSize:"20px", color:"#999"}}>
                            Click <FaHandPointer /> to view the file Content.</p>
                    </div>
                );
            default:
                return <img src={image || animation_url} alt={name} />;
        }
    };
    

    return <div>{renderPreview()}</div>;
};

export default NftDetailMedia;
