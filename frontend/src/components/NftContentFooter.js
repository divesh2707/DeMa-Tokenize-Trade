import React, {useState} from "react";
import { FaLink } from "react-icons/fa";
import NftContentActivity from "./NftContentActivity";

const NftContentFooter=({nft})=>{
    const [aboutActivity, setAboutActivity] = useState(true);
    const account = nft.contractAddress?`${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}`:"";
    return(
        <div className="nft-content-footer">
            <div className="nft-content-footer-headings">
                <div className={aboutActivity ? "active" : ""} onClick={() => setAboutActivity(true)}>
                    Activity
                </div>
                <div className={!aboutActivity ? "active" : ""} onClick={() => setAboutActivity(false)}>
                    About
                </div>
            </div>
            {
                !aboutActivity?(
                    <div style={{color:"white", marginTop:"20px"}}>
                        <p style={{marginBottom:"25px"}}>About this NFT</p>
                        <p style={{marginBottom:"30px"}}>{nft.description}</p>
                        <hr style={{color:"#999", marginBottom:"30px"}}/>
                        <p style={{marginBottom:"25px"}}>Blockchain Details</p>
                        <div className="nft-content-footer-blockchain">
                        <div>Contract Address</div>
                        <a href={`https://sepolia.etherscan.io/address/${nft.contractAddress}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                            <div style={{ color: "#ff9500", display: "flex", alignItems: "center", gap: "5px" }}>
                                {account}
                                <FaLink color="#ff9500" />
                            </div>
                        </a>
                        </div>

                        <div className="nft-content-footer-blockchain">
                        <div>Token Id</div>
                        <a href={nft.tokenUri} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                            <div style={{ color: "#ff9500", display: "flex", alignItems: "center", gap: "5px" }}>
                                {nft.tokenId}
                                <FaLink color="#ff9500" />
                            </div>
                        </a>
                        </div>

                        <div className="nft-content-footer-blockchain">
                            <div>Token Standard</div>
                            <div>{nft.TokenStandard}</div>
                        </div>
                        <div className="nft-content-footer-blockchain">
                            <div>Chain</div>
                            <div>{nft.Chain}</div>
                        </div>
                    </div>
                ):(
                    <>
                        <NftContentActivity contractAddress={nft.contractAddress} tokenId={nft.tokenId} startBlock={nft.startBlock}/>
                    </>
                )
            }
        </div>
    );
};

export default NftContentFooter;