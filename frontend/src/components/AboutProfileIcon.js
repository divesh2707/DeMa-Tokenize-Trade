import React, { useState, useRef, useEffect } from "react";
import "../styles/AboutProfileIcon.css"; // Ensure your styles are here or modify accordingly
import { FaUser } from "react-icons/fa";
import { IoCreateSharp } from "react-icons/io5";
import { RiLogoutBoxFill } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const AboutProfileicon = ({ account, avatarUrl, disconnectWallet }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="about-navbar-profile-wrapper" ref={dropdownRef}>
      <div className="about-navbar-profile" onClick={toggleDropdown} style={{ cursor: "pointer" }}>
        <img className="about-navbar-profile-image" src={avatarUrl} alt="Avatar" />
        <span style={{ color: "#ccc", fontSize: "16px", fontWeight: "bold" }}>
          {account.slice(2, 8)}...{account.slice(-4)}
        </span>
      </div>

      {showDropdown && (
        <div className="profile-icon-dropdown">
          <button className="profile-icon-dropdown-item" onClick={()=>{navigate("/")}}><div style={{display:"flex", alignItems:"center", gap:"10px"}}><MdFindInPage size={20}/> Discover</div></button>
          <button className="profile-icon-dropdown-item" onClick={()=>{navigate(`/${account}`);window.location.reload()}}><div style={{display:"flex", alignItems:"center", gap:"10px"}}><FaUser size={20}/> Profile</div></button>
          <button className="profile-icon-dropdown-item" onClick={()=>{navigate("/mint")}}><div style={{display:"flex", alignItems:"center", gap:"10px"}}><IoCreateSharp size={20}/> Tokenize Asset</div></button>
          <button className="profile-icon-dropdown-item"  onClick={()=>{navigate("/activity")}}><div style={{display:"flex", alignItems:"center", gap:"10px"}}><FaHistory size={20}/> Activities</div></button>
          <button className="profile-icon-dropdown-item" onClick={disconnectWallet}><div style={{display:"flex", alignItems:"center", gap:"10px"}}><RiLogoutBoxFill size={20}/> Logout</div></button>
        </div>
      )}
    </div>
  );
};

export default AboutProfileicon;
