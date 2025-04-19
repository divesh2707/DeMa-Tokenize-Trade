import React, { useState } from "react";
import { TrackingContract } from "../utils/contract";
import "../styles/ThirdModal.css";
import ErrorToast from "./ErrorToast";
import web3 from "../utils/web3";
import { BsShieldSlashFill } from "react-icons/bs";

const ThirdModal = ({ shipping_id, thirdParty, setRefetch, onClose }) => {
    const [addressInput, setAddressInput] = useState("");
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const maxAuthorized = 5;

    const handleAuthorize = async () => {
        const sanitizedInput = addressInput.trim().toLowerCase();
        if (!web3.utils.isAddress(sanitizedInput)) {
            setError("Invalid Ethereum address.");
            setShowToast(true);
            return;
        }
        if (!sanitizedInput) {
        setError("Address cannot be empty.");
        setShowToast(true);
        return;
        }
        if (thirdParty.includes(addressInput.toLowerCase())) {
            setError("Address is already authorized.");
            setShowToast(true);
            return;
        }
        if (thirdParty.length >= maxAuthorized) {
            setError("Maximum number of third parties already authorized.");
            setShowToast(true);
            return;
        }
        try {
            setLoading(true);
            await TrackingContract.methods
            .authorizeThirdParty(shipping_id, addressInput.toString())
            .send({ from: localStorage.getItem("dema_wallet") });
            setRefetch(prev => !prev); // trigger refetch if needed
            setAddressInput("");
        } catch (err) {
            console.error("Authorization failed:", err);
            setError("Authorization Failed!");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (addr) => {
        try {
            setLoading2(true);
            await TrackingContract.methods
            .revokeThirdParty(shipping_id, addr)
            .send({ from: localStorage.getItem("dema_wallet") });
            setRefetch(prev => !prev); // trigger refetch if needed
        } catch (err) {
            console.error("Revocation failed:", err);
            setError("Revocation Failed!");
            setShowToast(true);
        } finally {
            setLoading2(false);
        }
    };

    const remaining = maxAuthorized - thirdParty.length;

    return (
        <div className="third-modal-overlay">
            <div className="third-modal-container">
                <h2 className="third-modal-title">GRANT SHIPMENT ACCESS</h2>

                <div className="third-modal-input-section">
                    <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Enter address to authorize"
                        className="third-modal-input"
                        disabled={loading}
                    />
                    <button
                        onClick={handleAuthorize}
                        className="third-modal-authorize-btn"
                        disabled={loading || remaining <= 0 || !addressInput}
                    >
                        {loading ? "Authorizing..." : "Authorize"}
                    </button>
                </div>

                <p className="third-modal-info">You can Authorize atmost 5 addresses<br />
                <strong>{remaining} REMAINING</strong></p>

                {thirdParty.length > 0 && (
                    <div className="third-modal-list">
                        <h3 className="third-modal-subtitle">Verified Intermediaries</h3>
                        {thirdParty.map((addr) => (
                            <div key={addr} className="third-modal-entry">
                                <span className="third-modal-address">{addr}</span>
                                <button
                                    className="third-modal-revoke-btn"
                                    onClick={() => handleRevoke(addr)}
                                    disabled={loading2}
                                >
                                    <BsShieldSlashFill size={22}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={onClose} className="third-modal-close-btn" disabled={loading || loading2}>
                    Close
                </button>
            </div>
            {showToast && <ErrorToast message={error} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default ThirdModal;
