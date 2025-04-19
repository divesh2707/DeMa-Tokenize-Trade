import React, { useState } from "react";
import "../styles/UpdateModal.css";
import ErrorToast from "./ErrorToast";
import { TrackingContract } from "../utils/contract";

const UpdateModal = ({ onClose, shipmentId, length, setRefetch }) => {
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to request location permission
  const requestLocationPermission = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  // Function to fetch current location
  const getCurrentLocation = async () => {
    try {
      // First try to get location
      const position = await requestLocationPermission();

      const { latitude, longitude } = position.coords;
      return { latitude, longitude };
    } catch (err) {
      // If location permission is denied, prompt user again
      if (err.code === err.PERMISSION_DENIED) {
        setError("Location permission denied. Please enable location access.");
        setShowToast(true);
        setLoading(false);
      }
      return null; // Return null if location is unavailable
    }
  };

  // Function to encode coordinates to bytes
  const encodeCoordinatesToBytes = (latitude, longitude) => {
        const latInt = Math.round(latitude * 1e6);
        const longInt = Math.round(longitude * 1e6);
      
        // Convert each to 8-byte hex (16 characters)
        const latHex = latInt.toString(16).padStart(16, '0');
        const longHex = longInt.toString(16).padStart(16, '0');
      
        // Combine them = 32 characters (16 bytes)
        const combinedHex = latHex + longHex;
      
        // Pad to 64 hex chars (32 bytes)
        const paddedHex = combinedHex.padEnd(64, '0');
      
        return '0x' + paddedHex;
  };

  // Function to handle the shipment update
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation(); // Get the current location

      if (location === null) {setLoading(false);
      return; }// Exit if location is not available

      const { latitude, longitude } = location;
      const encoded = encodeCoordinatesToBytes(latitude, longitude);

      await TrackingContract.methods
        .updateShipment(shipmentId, encoded)
        .send({ from: localStorage.getItem("dema_wallet") });
    
      setRefetch((prev)=>!prev)
      setLoading(false);
      onClose(); // Close the modal after successful update
    } catch (err) {
    console.log(err)
      setError("Failed to update shipment");
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <div className="update-modal-overlay" onClick={onClose}>
      <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1>Confirm Shipment Update</h1>
        <p>
          This action will use your current GPS location to update tracking on the blockchain.
          <br />
          You can update the location up to 5 times. <br />
          <strong>{5 - length} Remaining</strong>
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
            {loading ? "Updating..." : `Update`}
          </button>
        </div>
      </div>
      {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default UpdateModal;
