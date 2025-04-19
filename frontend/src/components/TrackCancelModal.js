import React, { useState }  from "react";
import "../styles/UpdateModal.css";
import ErrorToast from "./ErrorToast";
import { TrackingContract } from "../utils/contract";

const TrackCancelModal=({ onClose, shipmentId, setRefetch })=>{
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        try {
          setLoading(true);
    
          const wallet = localStorage.getItem("dema_wallet");
          if (!wallet) {
            setError("Wallet not connected.");
            setShowToast(true);
            setLoading(false);
            return;
          }
    
          
          await TrackingContract.methods
            .cancelShipmentBySeller(shipmentId)
            .send({ from: wallet });
    
          setLoading(false);
          setRefetch((prev) => !prev); // Trigger refetch of shipment details
          onClose(); // Close the modal
        } catch (err) {
          console.error(err);
          setError("Failed to Cancel shipment.");
          setShowToast(true);
          setLoading(false);
        }
      };

    return(
        <div className="update-modal-overlay" onClick={onClose}>
      <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1>Cancel Shipment</h1>
        <p style={{ marginBottom: "15px" }}>
        You will receive a 2.5% penalty of the total item price, which means you won't receive a refund of the platform fee.
         The buyer will get a full refund of the NFT price."
        </p>

        <div className="update-modal-buttons" style={{ marginTop: "1rem" }}>
          <button
            className="update-modal-cancel-button"
            style={{
              backgroundColor: "#ff3b3b",
              outline: "none",
              border: "none",
              color: "white",
            }}
            onClick={onClose}
          >
            Back
          </button>
          <button
            className="update-modal-confirm-button"
            style={{ backgroundColor: "#118c01" }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Canceling..." : `Cancel`}
          </button>
        </div>
      </div>
      {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
    </div>
    );
};

export default TrackCancelModal;