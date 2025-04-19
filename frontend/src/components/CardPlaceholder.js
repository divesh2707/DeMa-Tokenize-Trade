import React from "react";
import "../styles/CardPlaceholder.css"; // CSS shown below

const CardPlaceholder = () => {
  return (
    <div className="card-placeholder-wrapper">
      <div className="placeholder-card gradient-1"></div>
      <div className="placeholder-card gradient-2"></div>
      <div className="placeholder-card gradient-3"></div>
      <div className="placeholder-card gradient-4"></div>
    </div>
  );
};

export default CardPlaceholder;
