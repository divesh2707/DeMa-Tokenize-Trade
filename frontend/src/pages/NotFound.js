import React from "react";
import error from "../images/404.webp"
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css"

const NotFound = () => {
    const navigate= useNavigate();
    
    return (
        <div className="page-not-found">
            <img src={error} alt="Page not Found" />
            <h1>404 - Page Not Found</h1>
            <p> Oops! The page you’re looking for doesn’t exist or might have been moved.</p>
            <button onClick={()=>{navigate("/")}}>Go to Home</button>
        </div>
    )
};

export default NotFound;
