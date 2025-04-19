import React from "react";
import error from "../images/403-forbidden-error-fi-removebg-preview.png"
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css"

const NotAuthorized = () => {
    const navigate= useNavigate();
    
    return (
        <div className="page-not-found">
            <img src={error} alt="Page not Found" style={{top:"160px"}}/>
            <h1>403 - Not Authorized</h1>
            <p>Oops! You do not have permission to view this page. Please check your address.</p>
            <button onClick={()=>{navigate("/")}}>Go to Home</button>
        </div>
    )
};

export default NotAuthorized;
