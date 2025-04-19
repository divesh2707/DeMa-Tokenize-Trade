import React from "react";
import { GoDotFill } from "react-icons/go";

const NftActivityFilter = ({ filters, setFilters }) => {
  const toggleFilter = (filterType) => {
    if (filterType === "All") {
      // Selecting "All" clears all other filters
      setFilters(["All"]);
    } else {
      // Deselect "All" if another filter is selected
      let newFilters = [...filters.filter(f => f !== "All")];
      
      if (filters.includes(filterType)) {
        // Remove if already selected
        newFilters = newFilters.filter(f => f !== filterType);
      } else {
        // Add to selected filters
        newFilters.push(filterType);
      }

      // If no filters selected, default back to All
      setFilters(newFilters.length > 0 ? newFilters : ["All"]);
    }
  };

  const isActive = (filterType) => filters.includes(filterType);

  return (
    <div className="nft-activity-filter-container">
      {["All", "Sale", "Listing", "Update", "Cancel", "Transfer", "Mint"].map((type) => (
        <div
          key={type}
          className={`nft-activity-filter-button ${isActive(type) ? "active" : ""}`}
          onClick={() => toggleFilter(type)}
          style={type !== "All" ? { paddingLeft: "4px" } : {}}
        >
          {type === "Sale" && <GoDotFill color="green" size={16} />}
          {type === "Listing" && <GoDotFill color="orange" size={16} />}
          {type === "Update" && <GoDotFill color="cyan" size={16} />}
          {type === "Cancel" && <GoDotFill color="red" size={16} />}
          {type}
        </div>
      ))}
    </div>
  );
};


export default NftActivityFilter;
