import React, { useState } from "react";
import "../style/HomeStyle.css";

const VisitedPlaces = ({ visitedPlaces }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(date).toLocaleDateString("bg-BG", options);
  };

  return (
    <section>
      <h2 className="visited-places-title">Посетени места</h2>
      <div className="visited-places-list">
        {visitedPlaces.length > 0 ? (
          <>
            <div className="desktop-list">
              {visitedPlaces.map((place, idx) => (
                <div className="visited-place-item" key={idx}>
                  <div className="visited-place-name">{place.name}</div>
                  <div className="visited-place-date">{formatDate(place.dateOfVisit)}</div>
                </div>
              ))}
            </div>

            <div className="mobile-button">
                <button onClick={() => setIsModalOpen(true)}>Покажи посетените места</button>
            </div>

            {isModalOpen && (
              <div className="visited-places-modal-overlay">
                <div className="visited-places-modal-content">
                  <div className="modal-header">
                    <h3>Посетени места</h3>
                    <button className="close-button" onClick={() => setIsModalOpen(false)}>
                      ✕
                    </button>
                  </div>
                  <div className="visited-places-list-modal">
                    {visitedPlaces.map((place, idx) => (
                      <div className="visited-place-item" key={idx}>
                        <div className="visited-place-name">{place.name}</div>
                        <div className="visited-place-date">{formatDate(place.dateOfVisit)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p>Няма посетени места.</p>
        )}
      </div>
    </section>
  );
};

export default VisitedPlaces;
