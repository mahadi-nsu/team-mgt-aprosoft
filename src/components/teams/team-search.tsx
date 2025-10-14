"use client";

import { useState } from "react";

interface TeamSearchBarProps {
  onSearch: (term: string) => void;
}

export default function TeamSearchBar({ onSearch }: TeamSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control"
        placeholder="Search team..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
        {searchTerm ? (
          <button
            type="button"
            className="btn btn-link p-0 text-muted"
            onClick={handleClearSearch}
            style={{ fontSize: "0.8rem" }}
          >
            ✕
          </button>
        ) : (
          <i className="fas fa-search text-muted"></i>
        )}
      </div>
    </div>
  );
}
