import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaPhone, FaStar, FaLandmark, FaPlusCircle, FaSort } from "react-icons/fa";
import "../style/MyPlaces.css";
import WorkTimeTable from '../components/WorkTimeTable';
import { useSelector } from 'react-redux';

const NationalSites = () => {
  // const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("nto100");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [placeDistances, setPlaceDistances] = useState({});
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const user = useSelector((state) => state.user.user); 

  const userCoordsRef = useRef(null);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const last = userCoordsRef.current;
  
            const isSame =
              last &&
              Math.abs(last.latitude - latitude) < 0.0001 &&
              Math.abs(last.longitude - longitude) < 0.0001;
  
            if (isSame) return;
  
            userCoordsRef.current = { latitude, longitude };
            updateAllDistances( position.coords );
          },
          (error) => {
            console.error("Грешка при взимане на локацията:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
          }
        );
      }, 2000);
  
      return () => clearInterval(intervalId);
    }, [places]);

  // useEffect(() => {
  //   const userSession = localStorage.getItem("userSession");
  //   if (userSession) {
  //     setUser(JSON.parse(userSession));
  //   }
  // }, []);

  useEffect(() => {
    if (user) {
      const fetchPlaces = async () => {
        try {
          const response = await axios.post(`${backendUrl}/nationalSites/getActiveNationalSites`, {
            userId: user.id
          });
          setPlaces(response.data);
        } catch (error) {
          console.error("Error fetching national sites", error);
        }
      };
      fetchPlaces();
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   if (id) {
  //     const selectedPlace = places.find((place) => place._id.toString() === id);
  //     if (selectedPlace) {
  //       fetchPlaceDetails(selectedPlace);
  //     }
  //   } else {
  //     setPlaceDetails(null);
  //   }
  // }, [id, places]);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setIsSortModalOpen(false); 
  };
  
  // const fetchPlaceDetails = async (place) => {

  //   try {
  //     const externalId = place.google_external_id;
  //     const response = await axios.post(`${backendUrl}/google/place-details`, {
  //       externalId
  //     });
  //     setPlaceDetails(response.data);
  //   } catch (error) {
  //     setPlaceDetails(null);
  //     console.error("Грешка при извличане на детайлите:", error);
  //   }
  // };

  const updateAllDistances = async (userCoordinates) => {
    try {
      const distances = {};  
      for (const place of places) {
        if (place.location) {
          const response = await axios.post(`${backendUrl}/google/place-distance`, {
            userLocation: userCoordinates,
            placeLocation: place.location,
          });
  
          distances[place._id] = response.data.distance;
        }
      }
      setPlaceDistances(distances);
    } catch (error) {
      console.error("Грешка при изчисляване на разстоянията:", error);
    }
  };

  const sortedPlaces = [...places].sort((a, b) => {
    switch (sortOrder) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "nto100": {
        const parseNumberWithSuffix = (str) => {
          const match = str.match(/^(\d+)(\D*)$/);
          return match ? [parseInt(match[1], 10), match[2] || ""] : [Infinity, ""];
        };
  
        const [numA, suffixA] = parseNumberWithSuffix(a.numberInNationalList);
        const [numB, suffixB] = parseNumberWithSuffix(b.numberInNationalList);
  
        if (numA !== numB) return numA - numB;
        return suffixA.localeCompare(suffixB, 'bg'); // Сортиране по букви
      }
      case "distance":
        return (parseFloat(placeDistances[a._id]) || Infinity) - (parseFloat(placeDistances[b._id]) || Infinity);
      default:
        return 0;
    }
  }); 

  const filteredPlaces = sortedPlaces.filter((place) => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlace = places.find((place) => place._id.toString() === id);

  const addThePlace = async (newPlace) => {
    try {
    await axios.post(`${backendUrl}/nationalSites/addNationalSiteToMyList`, {
      nationalSite: newPlace,
      userId: user.id
    });
    setMessage("Мястото е добавено успешно!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
    const response = await axios.post(`${backendUrl}/nationalSites/getActiveNationalSites`, {
            userId: user.id
          });
    setPlaces(response.data);
    } catch (error) {
      console.error("error: ", error?.response?.data?.error);
      setMessage("Грешка при добавяне на мястото!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const validWorkingHours = Array.isArray(placeDetails?.workingHours)
    ? placeDetails.workingHours
    : null;

  return (
    <div className="my-places-container">
      <div className="top-controls">
        <input
          type="text"
          placeholder="Търсене..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />




      {/* Падащо меню за десктоп */}
      {!isMobile && (
          <div className="sort-container">
            <select 
            className="sort-dropdown" 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="nto100">Национални 100</option>
            <option value="name-asc">Име (A-Z)</option>
            <option value="name-desc">Име (Z-A)</option>
            <option value="distance">Разстояние</option>
          </select>
          </div>
        )}

        {/* Бутон за сортиране за мобилни екрани */}
        {isMobile && (
          <button className="sort-btn" onClick={() => setIsSortModalOpen(true)}>
            <FaSort />
          </button>
        )}
      </div>

      {/* Модално прозорче за сортиране */}
      {isSortModalOpen && (
        <div className="sort-modal-overlay" onClick={() => setIsSortModalOpen(false)}>
          <div className="sort-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sort-modal-close" onClick={() => setIsSortModalOpen(false)}>×</button>
            <h2 className="sort-modal-title">Изберете метод за сортиране</h2>
            <div className="sort-modal-radio-group">
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
                  value="distance"
                  checked={sortOrder === "distance"}
                  onChange={handleSortChange}
                />
                Разстояние
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{ flexDirection: isMobile && id ? "column" : "row" }}>
        {!isMobile || !id ? (
          <div className="places-list">
          {filteredPlaces.length === 0 ? (
          <p className="place-details-placeholder">Няма активни национални обекти!</p>
          ) : (
            filteredPlaces.map((place) => (
              <div key={place._id} className="place-item" onClick={() => navigate(`/national-sites/${place._id}`)}>
                
                <span className="place-name">{place.numberInNationalList}. {place.name}</span>
                <div className="icons">
                  <span className="national-symbol">🏛️</span>
                </div>
              </div>
            ))
          )}
        </div>               
        ) : null}

        {!isMobile && <div className="divider"></div>}

        {(isMobile && id) || !isMobile ? (
          
          <div className="place-details">
            {selectedPlace ? (
              <>
          <div className="place-image-container">
            <img src={selectedPlace.imgPath} alt={selectedPlace.name} className="place-image" />
          </div>
    
          <div className="title-icons-container">
            <h2 className="place-title">{selectedPlace.numberInNationalList}. {selectedPlace.name}</h2>
            <div className="icons-container">
              <FaPlusCircle  
                className="icon visit-icon" 
                title="Добави мястото" 
                onClick={(e) => {
                  e.stopPropagation();
                  addThePlace(selectedPlace);
                }}
              />
            </div>
          </div>
    
          <div className="place-info-summary">
          {placeDistances[selectedPlace._id] && <span>{placeDistances[selectedPlace._id]} away</span>}
            {/* {placeDetails?.rating && (
              <>
                <span>|</span>
                <span>
                  {placeDetails.rating} <FaStar className="star-icon" />
                </span>
              </>
            )}
            {placeDetails?.phone && (
              <>
                <span>|</span>
                <span>
                  {placeDetails.phone} <FaPhone className="phone-icon" />
                </span>
              </>
            )} */}
                <span>|</span>
                <span>
                  <FaLandmark className="landmark-icon" /> National 100
                </span>
          </div>
    
          {selectedPlace?.address && (
            <div className="place-address">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.location.lat},${selectedPlace.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaMapMarkerAlt className="icon address-icon" title="Виж на картата" />
              </a>
              <span>{selectedPlace.address}</span>
            </div>
          )}
    
          <hr></hr>
                <div className="additional-info">
                  <p>{selectedPlace.description}</p>
                  {/* <div>{validWorkingHours && (
                    <>
                      <WorkTimeTable workTime={validWorkingHours} />
                    </>
                  )}
                  </div> */}
                </div>
                </>
          ) : (
            <p className="place-details-placeholder">Изберете място, за да видите детайлите.</p>
          )}
        </div>
        ) : null}
      </div>

      {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
    </div>
  );
};

export default NationalSites;
