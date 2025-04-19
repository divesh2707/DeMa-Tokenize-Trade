import React, {useEffect} from "react";

const UserActivityFilter = ({ filters, setFilters,setShipmentStatus, shipmentStatus }) => {
  const toggleFilter = (filterType) => {
    setShipmentStatus(false);
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

  useEffect(() => {
    if (shipmentStatus) {
      setFilters([]); // Clear all active filters
    }
  }, [shipmentStatus]);

  return (
    <div className="user-activity-filter-layout">
    <p>EVENTS</p>
    <div className="user-activity-filter-container">
        
      {["All", "Mint","Sale",  "Purchase", "Transfer","Listing", "Cancel", "Update" ].map((type) => (
        <div
          key={type}
          className={`user-activity-filter-button ${isActive(type) ? "active" : ""}`}
          onClick={() => toggleFilter(type)}
        >
        {type === "Purchase" }
          {type === "Sale" }
          
          {type === "Listing" }
          {type === "Cancel" }
          {type === "Update" }
          {type}
        </div>
      ))}
    </div>
    </div>
  );
};


export default UserActivityFilter;
