import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash, FaMapMarkerAlt, FaPhone, FaStar, FaLandmark, FaSort, FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../style/MyPlaces.css";
import AddNationalSiteModal from "../components/AddNationalSiteModal";
import WorkTimeTable from '../components/WorkTimeTable';
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useSelector } from 'react-redux';

const AdminNationalSites = () => {
  // const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("nto100");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [editData, setEditData] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const user = useSelector((state) => state.user.user); 
  
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
          const response = await axios.get(`${backendUrl}/nationalSites/getAllNationalSites`);
          setPlaces(response.data);
        } catch (error) {
          console.error("Error fetching places", error);
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
  //     if (selectedPlace && (!placeDetails || placeDetails._id !== selectedPlace._id)) {
  //       fetchPlaceDetails(selectedPlace);
  //     }
  //   } else {
  //     setPlaceDetails(null);
  //   }
  // }, [id, places, placeDetails]);
  
  
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

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setIsSortModalOpen(false);
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
      default:
        return 0;
    }

  });
  
  const filteredPlaces = sortedPlaces.filter((place) => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedPlace = places.find((place) => place._id.toString() === id);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseModalSuccess = async (newPlace) => {
    setIsModalOpen(false);
    setMessage("Мястото е добавено успешно!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${backendUrl}/nationalSites/deleteNationalSite`, {
        data: { placeId: placeToDelete } 
      });      
      const response = await axios.get(`${backendUrl}/nationalSites/getAllNationalSites`);
      setPlaces(response.data);
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

  const validWorkingHours = Array.isArray(placeDetails?.workingHours)
    ? placeDetails.workingHours
    : null;

  return (
    <div className="my-places-container">
      <div className="top-controls">
        <button className="add-btn" onClick={() => {
                  setEditData(null); 
                  setIsModalOpen(true);
                }}>
          <FaPlus title="Добави място" />
        </button>
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
              <div key={place._id} className="place-item" onClick={() => navigate(`/admin/national-sites/${place._id}`)}>
                <span
                  className={`place-name ${!place.isActive ? "inactive-place" : ""}`}
                >
                  {place.numberInNationalList}. {place.name}
                </span>
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
              <FaTrash
                className="icon delete-icon"
                title="Изтрий"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(selectedPlace._id);
                }}
              />
              <FaEdit
                className="icon edit-icon"
                title="Редактирай"
                onClick={() => {
                  setEditData(selectedPlace); 
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>
    
          <div className="place-info-summary">
            {/* {placeDetails?.rating && (
              <>
                <span>
                  {placeDetails.rating} <FaStar className="star-icon" />
                </span>
              </>
            )}
                {placeDetails?.phone && (
              <>
                <span>|</span>
                <span>
                  {placeDetails?.phone} <FaPhone className="phone-icon" />
                </span>
              </>
            )}
                <span>|</span> */}
                <span>
                  <FaLandmark className="landmark-icon" /> National 100
                </span>
                <span>|</span>
                <span className={`place-status ${selectedPlace.isActive ? "active" : "inactive"}`}>
                  {selectedPlace.isActive ? (
                    <>
                      <FaCheckCircle className="status-icon" /> Активен
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="status-icon" /> Неактивен
                    </>
                  )}
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
      
      {isModalOpen && (
      <AddNationalSiteModal
        setIsModalOpen={handleCloseModal}
        setIsModalOpenSuccess={handleCloseModalSuccess}
        user={user}
        setPlaces={setPlaces}
        setSuccess={setSuccess}
        editMode={!!editData}
        initialData={editData}
        placeId={editData?._id}
      />
    )}

      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}

    </div>
  );
};

export default AdminNationalSites;
