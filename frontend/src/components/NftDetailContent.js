import React, { use } from "react";
import "../styles/NftDetailContent.css"
import { useNavigate } from "react-router-dom";
import { FaEthereum } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import NftDetailContentButton from "./NftDetailContentButton";
import NftContentTraits from "./NftContentTraits";
import NftContentFooter from "./NftContentFooter";

const NftDetailContent=({nft, setPrice, setShowBuyModal, setShowItemModal, setShowCancelModal, setShowUpdateModal})=>{
    const navigate = useNavigate();
    const owner = nft.owner? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : "unknown";
    const chain = nft.chain? `${nft.chain.toUpperCase()}` : "SEPOLIA";

    return(
        <> 
            <h1 className="nft-detail-content-name">{nft.name}</h1>
            <div className="nft-detail-content-name-bottom">
                <p style={{marginRight:"10px"}}>Owned by</p>
                <div className="nft-detail-content-name-bottom-owner" >{owner} 
                    <div onClick={()=>{navigate(`/${nft.owner}`)}} style={{cursor:"pointer"}}><FaExternalLinkAlt /></div></div>
            </div>
            <div className="nft-detail-content-tags">
                <div className="nft-detail-content-tag">
                    {nft.TokenStandard}
                </div>
                <div className="nft-detail-content-tag">
                    <FaEthereum />{chain}
                </div>
            </div>
            <hr style={{color:"#999"}}/>
            <div>
                <NftDetailContentButton nft={nft} setPrice2={setPrice} setShowBuyModal={setShowBuyModal} 
                    setShowItemModal={setShowItemModal} setShowCancelModal={setShowCancelModal} setShowUpdateModal={setShowUpdateModal}/>
            </div>
           <div>
                <NftContentTraits traits={nft.attributes} />
                <hr style={{color:"#999", marginTop:"40px"}}/>
           </div>
           <div>
                <NftContentFooter nft={nft}/>
           </div>
        </>
    );
};

export default NftDetailContent;