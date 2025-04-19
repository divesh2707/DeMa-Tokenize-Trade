import React, { useState } from "react";
import "../styles/UpdateModal.css";
import ErrorToast from "./ErrorToast";
import { TrackingContract } from "../utils/contract";

const RejectModal = ({ onClose, shipmentId, setRefetch }) => {
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0); // Selected reason index

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
        .rejectDelivery(shipmentId, value)
        .send({ from: wallet });

      setLoading(false);
      setRefetch((prev) => !prev); // Trigger refetch of shipment details
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      setError("Failed to reject shipment.");
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <div className="update-modal-overlay" onClick={onClose}>
      <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1>Reject Shipment</h1>
        <p style={{ marginBottom: "15px" }}>
          You will be refunded 98.75% of the NFT price. The NFT will be transferred back to the seller.
          <br />
          You must select a reason for rejection.
        </p>
        <div className="reject-modal-options">
          <div
            className={`reject-modal-option ${value === 0 ? "selected" : ""}`}
            onClick={() => setValue(0)}
          >
            Damaged
          </div>
          <div
            className={`reject-modal-option ${value === 1 ? "selected" : ""}`}
            onClick={() => setValue(1)}
          >
            Wrong Item
          </div>
          <div
            className={`reject-modal-option ${value === 2 ? "selected" : ""}`}
            onClick={() => setValue(2)}
          >
            Other
          </div>
        </div>
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
            disabled={loading || value === null}
          >
            {loading ? "Rejecting..." : `Reject`}
          </button>
        </div>
      </div>
      {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default RejectModal;
