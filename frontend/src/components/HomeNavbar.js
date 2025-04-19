import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom"
import logo from "../images/dema-high-resolution-logo-removebg-preview.png"
import "../styles/AboutNavbar.css";
import AboutNavbarSearch from "./AboutNavbarSearch";
import AboutProfileicon from "./AboutProfileIcon";
import { HiWallet } from "react-icons/hi2";
import { FaEthereum } from "react-icons/fa";
import web3 from "../utils/web3";

const HomeNavbar = ({lg, setSearchQuery}) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [balance, setBalance] = useState(0.00);

  // Fetch balance and avatar
  const updateAccountInfo = async (acc) => {
    if (!acc) return;

    setAccount(acc);
    web3.eth.defaultAccount = acc;
    localStorage.setItem("dema_wallet", acc);

    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${acc}`;
    setAvatarUrl(url);

    const balanceWei = await web3.eth.getBalance(acc);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    setBalance(parseFloat(balanceEth).toFixed(2));
  };

  useEffect(() => {
    const savedAccount = localStorage.getItem("dema_wallet");
  
    // Function to check if MetaMask is actually unlocked
    const checkMetaMaskStatus = async () => {
      if (!window.ethereum) return;
  
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
  
      if (accounts.length > 0) {
        updateAccountInfo(accounts[0]);
      } else {
        disconnectWallet(); // MetaMask locked or disconnected
      }
    };
  
    if (savedAccount) {
      checkMetaMaskStatus();
    }
  
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          updateAccountInfo(accounts[0]);
        } else {
          disconnectWallet();
        }
      };
  
      window.ethereum.on("accountsChanged", handleAccountsChanged);
  
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
  
    const interval = setInterval(async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          disconnectWallet();
          window.location.reload(); // MetaMask locked or disconnected
        }
      } catch (err) {
        console.error("Error checking MetaMask lock status", err);
      }
    }, 15000); // Check every 15 seconds
  
    return () => clearInterval(interval);
  }, []);
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        updateAccountInfo(accounts[0]);
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(0.0);
    setAvatarUrl("");
    localStorage.removeItem("dema_wallet");
    navigate("/");
  };

  return (
    <div className="home-navbar-div" style={{ backgroundImage: lg }}>
  {/* Left: Logo */}
  <img className="about-logo" src={logo} alt="DeMa" />

  {/* Center: Search */}
  <div className="navbar-center">
    <AboutNavbarSearch setSearchQuery={setSearchQuery}/>
  </div>

  {/* Right: Wallet/Balance/Profile */}
  <div className="navbar-right">
    {account ? (
      <>
        <div className="about-navbar-profile-balance">
          <FaEthereum /> {balance} ETH
        </div>
        <div className="navbar-divider"></div>
        <AboutProfileicon
          avatarUrl={avatarUrl}
          account={account}
          disconnectWallet={disconnectWallet}
        />
      </>
    ) : (
      <button className="about-navbar-button" onClick={connectWallet}>
        <HiWallet size={20} /> Connect Wallet
      </button>
    )}
  </div>
</div>

  );
};

export default HomeNavbar;
