import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaSort, FaHeart, FaTrash, FaMapMarkerAlt, FaPhone, FaStar, FaLandmark, FaCompass } from "react-icons/fa";
import "../style/MyPlaces.css";
import WorkTimeTable from '../components/WorkTimeTable';
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import Modal from "react-modal";
import SortOrderModal from '../components/SortOrderModal'

const Nearby = () => {
  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [newPlaces, setNewPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("distance");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [placeholderMessage, setPlaceholderMessage] = useState("Моля изчакайте, разстоянието се изчислява...");
  const [success, setSuccess] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [placeDistances, setPlaceDistances] = useState({});

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

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

  useEffect(() => {
    if (user) {
      const fetchPlaces = async () => {
        try {
          const response = await axios.get(`${backendUrl}/places/getUserPlaces`, {
            params: { userId: user.id, visited: false }
          });
          setPlaces(response.data);
        } catch (error) {
          console.error("Error fetching places", error);
        }
      };
      fetchPlaces();
    }
  }, [user, host, port]);
  
  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      const selectedPlace = newPlaces.find((place) => place._id.toString() === id);
      if (selectedPlace) {
        fetchPlaceDetails(selectedPlace);
      }
    } else {
      setPlaceDetails(null);
    }
  }, [id, newPlaces]);
  
  const fetchPlaceDetails = async (place) => {

    try {
      const externalId = place.google_external_id;
      const response = await axios.post(`${backendUrl}/google/place-details`, {
        externalId
      });
      setPlaceDetails(response.data);
    } catch (error) {
      setPlaceDetails(null);
      console.error("Грешка при извличане на детайлите:", error);
    }
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setIsSortModalOpen(false); 
  };

  const updateAllDistances = async (userCoordinates) => {
    try {
      const distances = {};  
      for (const place of places) {
        if (place.location) {
          const response = await axios.post(`${backendUrl}/google/place-distance`, {
            userLocation: userCoordinates,
            placeLocation: place.location,
          });
  
          if(parseFloat(response.data.distance)<10){
            distances[place._id] = response.data.distance;
          }
        }
      }
      setPlaceDistances(distances);

      const response = await axios.get(`${backendUrl}/places/getUserPlaces`, {
          params: { userId: user.id, visited: false }
      });

      const filteredPlaces = response.data.filter(place => distances.hasOwnProperty(place._id));
      setNewPlaces(filteredPlaces);
      setPlaceholderMessage("Нямате активни места за посещение!");
    } catch (error) {
      console.error("Грешка при изчисляване на разстоянията:", error);
    }
  };
  
  const sortedPlaces = [...newPlaces].sort((a, b) => {
    switch (sortOrder) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "favourites":
        return (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0) || a.name.localeCompare(b.name);
      case "nto100":
        return (b.nto100 ? 1 : 0) - (a.nto100 ? 1 : 0) || a.name.localeCompare(b.name);
        case "distance":
          return (parseFloat(placeDistances[a._id]) || Infinity) - (parseFloat(placeDistances[b._id]) || Infinity);        
      default:
        return 0;
    }
  });
  
  const filteredPlaces = sortedPlaces.filter((place) => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedPlace = newPlaces.find((place) => place._id.toString() === id);

  const toggleFavourite = async (placeId, currentStatus) => {
    try {
      const updatedStatus = !currentStatus; 
      await axios.put(`${backendUrl}/places/updateFavourite`, {
        placeId,
        isFavourite: updatedStatus,
      });
  
      setNewPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place._id === placeId ? { ...place, isFavourite: updatedStatus } : place
        )
      );
    } catch (error) {
      console.error("Error updating favourite status:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${backendUrl}/places/deletePlace`, {
        data: { placeId: placeToDelete } 
      });      

      delete placeDistances[placeToDelete];
      const response = await axios.get(`${backendUrl}/places/getUserPlaces`, {
        params: { userId: user.id, visited: false }
      });
      const filteredPlaces = response.data.filter(place => placeDistances.hasOwnProperty(place._id));
      setNewPlaces(filteredPlaces);
      closeDeleteModal();
      setMessage("Мястото е изтрито успешно!");
      setSuccess(true);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("error deleting place: ", error);
      setMessage("Проблем с изтриване на мястото!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const openDeleteModal = (placeId) => {
    setPlaceToDelete(placeId);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPlaceToDelete(null);
  };

  const visitThePlace = async (placeId, nto100) => {
    try {
    const isVisitSuccess = await axios.put(`${backendUrl}/places/visitPlace`, {
      placeId: placeId,
      placeDistance: placeDistances[selectedPlace._id]
    });

    if(isVisitSuccess){
      const updatePoints = await axios.put(`${backendUrl}/users/updatePoints`, {
         id: user.id, 
         nto100: nto100
      });
    }

    delete placeDistances[placeId];
    const response = await axios.get(`${backendUrl}/places/getUserPlaces`, {
      params: { userId: user.id, visited: false }
    });
    const filteredPlaces = response.data.filter(place => placeDistances.hasOwnProperty(place._id));
    setNewPlaces(filteredPlaces);
    setMessage("Мястото е посетено успешно!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("error visiting place: ", error);
      setMessage(error?.response?.data?.error);
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
              <option value="name-asc">Име (A-Z)</option>
              <option value="name-desc">Име (Z-A)</option>
              <option value="favourites">Любими</option>
              <option value="nto100">Национални 100</option>
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
        <SortOrderModal
          sortOrder={sortOrder} 
          handleSortChange={handleSortChange} 
          setIsSortModalOpen={setIsSortModalOpen} 
        />
      )}

      <div className="content" style={{ flexDirection: isMobile && id ? "column" : "row" }}>
        {!isMobile || !id ? (
          <div className="places-list">
          {filteredPlaces.length === 0 ? (
          <p className="place-details-placeholder">{placeholderMessage}</p>
          ) : (
            filteredPlaces.map((place) => (
              <div key={place._id} className="place-item" onClick={() => navigate(`/nearby-places/${place._id}`)}>
                <span className="place-name">{place.name}</span>
                <div className="icons">
                  {place.nto100 && <span className="national-symbol">🏛️</span>}
                  <FaHeart
                    className="heart-icon"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleFavourite(place._id, place.isFavourite);
                    }}
                    style={{ color: place.isFavourite ? "red" : "gray", cursor: "pointer" }}
                  />
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
            <h2 className="place-title">{selectedPlace.name}</h2>
            <div className="icons-container">
              <FaHeart
                className="icon heart-icon"
                onClick={(e) => {
                  e.stopPropagation(); 
                  toggleFavourite(selectedPlace._id, selectedPlace.isFavourite);
                }}
                style={{ color: selectedPlace.isFavourite ? "red" : "gray", cursor: "pointer" }}
              />
              <FaTrash
                className="icon delete-icon"
                title="Изтрий"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(selectedPlace._id);
                }}
              />
              <FaCompass 
                className="icon visit-icon" 
                title="Посети мястото" 
                onClick={(e) => {
                  e.stopPropagation();
                  visitThePlace(selectedPlace._id, selectedPlace.nto100);
                }}
              />
            </div>
          </div>
    
          <div className="place-info-summary">
          {placeDistances[selectedPlace._id] && <span>{placeDistances[selectedPlace._id]} away</span>}
            {placeDetails?.rating && (
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
            )}
            {selectedPlace?.nto100 !==undefined && (
              <>
                <span>|</span>
                <span>
                  <FaLandmark className="landmark-icon" /> National 100
                </span>
              </>
            )}
          </div>
    
          {placeDetails?.address && (
            <div className="place-address">
              <a href={placeDetails.googleMapsUri} target="_blank" rel="noopener noreferrer">
                <FaMapMarkerAlt className="icon address-icon" title="Виж на картата" />
              </a>
              <span>{placeDetails.address}</span>
            </div>
          )}
    
          <hr></hr>
                <div className="additional-info">
                  <p>{selectedPlace.description}</p>
                  <div>{validWorkingHours && (
                    <>
                      <WorkTimeTable workTime={validWorkingHours} />
                    </>
                  )}
                  </div>
                </div>
                </>
          ) : (
            <p className="place-details-placeholder">Изберете място, за да видите детайлите.</p>
          )}
        </div>
        ) : null}
      </div>

      {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}

      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}

    </div>
  );
};

export default Nearby;
