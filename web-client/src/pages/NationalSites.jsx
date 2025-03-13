import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaPhone, FaStar, FaLandmark, FaPlusCircle } from "react-icons/fa";
import "../style/MyPlaces.css";
import WorkTimeTable from '../components/WorkTimeTable';

const NationalSites = () => {
  const [user, setUser] = useState(null);
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
  
  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPlaces = async () => {
        try {
          const response = await axios.get("http://localhost:3001/nationalSites/getActiveNationalSites");
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

  useEffect(() => {
    if (id) {
      const selectedPlace = places.find((place) => place._id.toString() === id);
      if (selectedPlace) {
        fetchPlaceDetails(selectedPlace);
      }
    } else {
      setPlaceDetails(null);
    }
  }, [id, places]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateAllDistances(position.coords);
      },
      (error) => console.error("Грешка при получаване на локация:", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  
    return () => navigator.geolocation.clearWatch(watchId);
  }, [places]);
  
  const fetchPlaceDetails = async (place) => {

    try {
      const response = await axios.post("http://localhost:3001/google/place-details", {
        place
      });
      setPlaceDetails(response.data);
    } catch (error) {
      setPlaceDetails(null);
      console.error("Грешка при извличане на детайлите:", error);
    }
  };

  const updateAllDistances = async (userCoordinates) => {
    try {
      const distances = {};  
      for (const place of places) {
        if (place.location) {
          const response = await axios.post("http://localhost:3001/google/place-distance", {
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
  
  // const sortedPlaces = [...places].sort((a, b) => {
  //   switch (sortOrder) {
  //     case "name-asc":
  //       return a.name.localeCompare(b.name);
  //     case "name-desc":
  //       return b.name.localeCompare(a.name);
  //     case "nto100":
  //       return parseInt(a.numberInNationalList) - parseInt(b.numberInNationalList);
  //       case "distance":
  //         return (parseFloat(placeDistances[a._id]) || Infinity) - (parseFloat(placeDistances[b._id]) || Infinity);        
  //     default:
  //       return 0;
  //   }
  // });

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
  
  

  // const sortedPlaces = [...places].sort((a, b) => {
  //   function parseNumber(str) {
  //     const match = str.match(/^(\d+)(\D*)$/);
  //     return match ? [parseInt(match[1], 10), match[2] || ""] : [Infinity, ""];
  //   }
  
  //   if (sortOrder === "nto100") {
  //     const [numA, suffixA] = parseNumber(a.numberInNationalList);
  //     const [numB, suffixB] = parseNumber(b.numberInNationalList);
  
  //     // Първо сравняваме числата
  //     if (numA !== numB) return numA - numB;
  
  //     // После сравняваме азбучно буквената част (ако я има)
  //     return suffixA.localeCompare(suffixB, 'bg');
  //   }
  
  //   return 0; // Ако не сортираме по NTO100
  // });  

  const filteredPlaces = sortedPlaces.filter((place) => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlace = places.find((place) => place._id.toString() === id);

  const addThePlace = async (newPlace) => {
    try {
    await axios.post("http://localhost:3001/nationalSites/addNationalSiteToMyList", {
      nationalSite: newPlace,
      email: user?.email
    });
    setMessage("Мястото е добавено успешно!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
    const response = await axios.get("http://localhost:3001/nationalSites/getActiveNationalSites");
    setPlaces(response.data);
    } catch (error) {
      console.log("error: ", error?.response?.data?.error);
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
        {!isMobile || !id ? (
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
        ) : null}
      </div>

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
                title="Посети мястото" 
                onClick={(e) => {
                  e.stopPropagation();
                  addThePlace(selectedPlace);
                }}
              />
            </div>
          </div>
    
          {/* Основни детайли с вертикални разделители */}
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
                <span>|</span>
                <span>
                  <FaLandmark className="landmark-icon" /> National 100
                </span>
          </div>
    
          {/* Адрес на нов ред с иконка */}
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
    </div>
  );
};

export default NationalSites;
