import React from "react";
import nothing from "../images/rr-removebg-preview.png"

const NftNoActivityPlaceholder=()=>{
    return(
        <div className="nft-body-nothing">
          <img src={nothing} alt="Nothing There!" />
          <h1>Nothing There!</h1>
        </div>
    );
};

export default NftNoActivityPlaceholder;