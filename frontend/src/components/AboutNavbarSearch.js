import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const AboutNavbarSearch = ({ setSearchQuery }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchQuery(input.trim());
    }
  };

  return (
    <div className="navbar-search">
      <FaSearch size={22} color="#ccc" />
      <input
        type="text"
        placeholder="Search everything DeMa offers..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default AboutNavbarSearch;
