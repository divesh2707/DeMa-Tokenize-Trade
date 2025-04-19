import { useState, useEffect } from "react";
import "../styles/ProfileFilter.css";

const ProfileFilter = ({ onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [maxPrice, setMaxPrice] = useState(2);

  useEffect(() => {
    onFilterChange({ search, assetType, listingStatus, maxPrice });
  }, [search, assetType, listingStatus, maxPrice]);

  return (
    <div className="profile-filter-container">
      <input
        type="text"
        placeholder="Search NFT by Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="profile-filter-search"
      />

      <div className="profile-filter-group">
        <label className="profile-filter-label">CATEGORY</label>
        <div className="profile-filter-buttons">
          {["", "digital", "physical"].map((type) => (
            <button
              key={type}
              onClick={() => setAssetType(type)}
              className={`profile-filter-button ${assetType === type ? "selected" : ""}`}
            >
              {type === "" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-filter-group">
        <label className="profile-filter-label">STATUS</label>
        <div className="profile-filter-buttons">
          {["", "listed", "unlisted"].map((status) => (
            <button
              key={status}
              onClick={() => setListingStatus(status)}
              className={`profile-filter-button ${listingStatus === status ? "selected" : ""}`}
            >
              {status === ""
                ? "All"
                : status === "listed"
                ? "Listed"
                : "Not Listed"}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-filter-group">
        <label className="profile-filter-label">ETH PRICE CAP</label>
        <input
          type="number"
          min={0}
          max={2}
          step={0.0001}
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
          className="profile-filter-search"
        />
      </div>
    </div>
  );
};

export default ProfileFilter;
