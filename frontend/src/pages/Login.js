import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import { HiWallet } from "react-icons/hi2";
import metamaskLogo from "../images/metamask.png";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || "/";

  useEffect(() => {
    const saved = localStorage.getItem("dema_wallet");
    if (saved) {
      navigate(redirectPath); // Already logged in
    }
  }, [navigate, redirectPath]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const user = accounts[0];
        localStorage.setItem("dema_wallet", user);
        navigate(redirectPath); // Go to original page
      } catch (err) {
        setError("Connection request rejected.");
      }
    } else {
      setError("MetaMask not detected.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-box">
        <img src={metamaskLogo} alt="MetaMask" className="login-page-logo" />
        <h1 className="login-page-title">Welcome to DeMa</h1>
        <p className="login-page-subtitle">Connect your wallet to continue</p>
        <button className="login-page-button" onClick={connectWallet}>
          <HiWallet size={20} /> Connect with MetaMask
        </button>
        {error && <p className="login-page-error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
