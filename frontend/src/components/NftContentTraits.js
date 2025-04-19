import React, { useState } from "react";

const NftContentTraits=({traits})=>{
    const [trait, setTrait] = useState(traits || []);
    const length = traits?traits.length:1;
    return(
        <>
            <p className="nft-detail-content-traits">TRAITS <span style={{color:"#999", marginLeft:"6px"}}>{length}</span></p>
            <div className="nft-detail-content-traits-container">
            {   
                trait.map((t, index)=>{
                    return(
                        <div key={index} className="nft-detail-content-trait">
                            <p style={{marginBottom:"15px"}}>{t.trait_type}</p>
                            <p style={{color:"white"}}>{t.value}</p>
                        </div>
                    )
                })
            }
            </div>
        </>
    );
};

export default NftContentTraits;