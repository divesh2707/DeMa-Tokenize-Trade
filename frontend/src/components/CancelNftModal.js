import React, {useState} from "react";
import "../styles/CancelNftModal.css";
import { MarketplaceContract } from "../utils/contract";
import ErrorToast from "./ErrorToast";

const CancelNFTModal = ({ onClose, token }) => {
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleConfirm=async()=>{
            setLoading(true);
        try{
            console.log(token)
            await MarketplaceContract.methods.cancelListing(token.contractAddress, token.tokenid).send({ from: localStorage.getItem("dema_wallet") });
            setLoading(false);
            onClose(); 
            window.location.reload();
        }catch(err){
            console.log(err);
            setLoading(false);
            setError("Cancel Failed");
            setShowToast(true);
        }
    }

    return (
        <div className="cancel-nft-modal-overlay" onClick={onClose}>
            <div className="cancel-nft-modal-container" onClick={(e) => e.stopPropagation()}>
                <h1>Are you sure?</h1>
                <p>You’re about to cancel this listing.</p>
                <div className="cancel-nft-modal-buttons">
                    <button className="cancel-nft-modal-cancel-button" onClick={onClose}>No, Keep it</button>
                    <button className="cancel-nft-modal-confirm-button" onClick={handleConfirm} disabled={loading}>{!loading?"Yes, Cancel":"Canceling..."}</button>
                </div>
            </div>
            {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default CancelNFTModal;
