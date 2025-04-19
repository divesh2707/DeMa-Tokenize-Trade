import React, { useState } from "react";
import "../styles/UpdateModal.css";
import ErrorToast from "./ErrorToast";
import { TrackingContract } from "../utils/contract";

const DeliveredModal = ({ onClose, shipmentId, setRefetch }) => {
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
        .markAsDelivered(shipmentId)
        .send({ from: wallet });
  
      setLoading(false);
      setRefetch((prev)=>!prev); // Trigger refetch of shipment details
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      setError("Failed to finalize shipment.");
      setShowToast(true);
      setLoading(false);
    }
  };  
    
  return (
    <div className="update-modal-overlay" onClick={onClose}>
      <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1>Finalize Shipment</h1>
        <p>
        Mark this shipment as delivered to complete the transaction and update its final status on the blockchain.
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
            No, Cancel
          </button>
          <button
            className="update-modal-confirm-button"
            style={{ backgroundColor: "#118c01" }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Finalizing..." : `Finalize`}
          </button>
        </div>
      </div>
      {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default DeliveredModal;
