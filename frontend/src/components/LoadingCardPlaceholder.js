import React from "react";
import "../styles/LoadingCardPlaceholder.css";

const LoadingCardPlaceholder = () => {
  return (
    <div className="Loading-item-placeholder-card">
      <div className="shimmer-box image" />
      <div className="shimmer-box title" />
      <div className="shimmer-box subtitle" />
      <div className="shimmer-box subtitle" />
    </div>
  );
};

export default LoadingCardPlaceholder;
