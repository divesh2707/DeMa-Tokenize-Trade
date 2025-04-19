import React from "react";
import CardPlaceholder from "./CardPlaceholder";
import nothing from "../images/Screenshot_2025-04-06_224238-removebg-preview.png";
import { useNavigate } from "react-router-dom";

const ProfileBodyNothing=({setSubItem, subItem})=>{
    const navigate = useNavigate();

    return(
        <div className="profile-body-nothing">
          <CardPlaceholder />
          <img src={nothing} alt="Nothing There!" />
          {subItem === "Items" ? (
            <>
              <h1>No items found</h1>
              <button onClick={() => navigate("/")}>Go to Discover</button>
            </>
          ) : subItem === "Listings" ? (
            <>
              <h1 style={{ left: "410px" }}>No Listings found</h1>
              <button onClick={() => setSubItem("Items")}>View Your Items</button>
            </>
          ) : (
            <>
              <h1 style={{ left: "425px" }}>No Activities yet</h1>
              <button onClick={() => navigate("/")}>Go to Discover</button>
            </>
          )}
        </div>
    );
};

export default ProfileBodyNothing;