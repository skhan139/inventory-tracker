import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for a product..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;