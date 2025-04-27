import React from 'react';
import '../style/SortOrderModal.css' 

const SortModal = ({ sortOrder, handleSortChange, setIsSortModalOpen }) => {
  return (
    <div className="sort-modal-overlay" onClick={() => setIsSortModalOpen(false)}>
      <div className="sort-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="sort-modal-close" onClick={() => setIsSortModalOpen(false)}>×</button>
        <h2 className="sort-modal-title">Изберете метод за сортиране</h2>
        <div className="sort-modal-radio-group">
          <label>
            <input
              type="radio"
              value="name-asc"
              checked={sortOrder === "name-asc"}
              onChange={handleSortChange}
            />
            Име (A-Z)
          </label>
          <label>
            <input
              type="radio"
              value="name-desc"
              checked={sortOrder === "name-desc"}
              onChange={handleSortChange}
            />
            Име (Z-A)
          </label>
          <label>
            <input
              type="radio"
              value="favourites"
              checked={sortOrder === "favourites"}
              onChange={handleSortChange}
            />
            Любими
          </label>
          <label>
            <input
              type="radio"
              value="nto100"
              checked={sortOrder === "nto100"}
              onChange={handleSortChange}
            />
            Национални 100
          </label>
          <label>
            <input
              type="radio"
              value="distance"
              checked={sortOrder === "distance"}
              onChange={handleSortChange}
            />
            Разстояние
          </label>
        </div>
      </div>
    </div>
  );
};

export default SortModal;
