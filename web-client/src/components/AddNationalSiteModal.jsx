import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "../style/AddPlaceModal.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const myLocationIcon  = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AddNationalSiteModal = ({ setIsModalOpen, user, setPlaces, setIsModalOpenSuccess, placeId, initialData, editMode }) => {
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [numberInNationalList, setNumberInNationalList] = useState("");
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const mapRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
    handleLocate();
  }, [editMode, initialData]);

  const handleLocate = async () => {
    centerToMyLocation();
    if (editMode && initialData) {
      setPlaceName(initialData.name || "");
      setDescription(initialData.description || "");
      setSelectedLocation(initialData.location || null);
      setNumberInNationalList(initialData.numberInNationalList || "");
      setIsActive(initialData.isActive ?? true);
      setSelectedPlaceId(initialData.google_external_id || null);
      setSelectedAddress(initialData.address);
    }
  }

  const centerToMyLocation = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setCenter(coords);
            if (mapRef.current) {
              mapRef.current.setView(coords, 14);
            }
          },
          (err) => {
            setCenter({ lat: 42.698334, lng: 23.319941 });
            console.warn("Не можа да вземе локацията:", err.message);
          }
        );
      }
  } 

useEffect(() => {
  if (selectedLocation && mapRef.current) {
    mapRef.current.setView(selectedLocation, 14);
  }
}, [selectedLocation]);

// const handleSearchPlace = async () => {
//   if (!placeName) {
//     setMessage("Моля, въведете име на място!");
//     setSuccess(false);
//     setTimeout(() => setMessage(""), 3000);
//     return;
//   }

//   try {
//     const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
//       params: {
//         q: placeName,
//         format: "json",
//         addressdetails: 1,
//       },
//     });

//     const results = response.data; 
//     const result = results.find(result => 
//       result.address && result.address.country === "Bulgaria"
//     ) || results[0];

//     if (response.data && response.data.length > 0) {
//       const location = {
//         lat: parseFloat(result.lat),
//         lng: parseFloat(result.lon),
//       };

//       setSelectedLocation(location);
//       setSelectedPlaceId(result.osm_id);
//       setSelectedAddress(result.display_name);
//     } else {
//       setMessage("Мястото не беше намерено.");
//       setSuccess(false);
//       setTimeout(() => setMessage(""), 3000);
//     }
//   } catch (error) {
//     console.error("Error searching place", error);
//     setMessage("Грешка при търсенето на място.");
//     setSuccess(false);
//     setTimeout(() => setMessage(""), 3000);
//   }
// };


const handleSearchPlace = async () => {
  if (!placeName) {
    setMessage("Моля, въведете име на място!");
    setSuccess(false);
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: placeName,
        format: "json",
        addressdetails: 1
      },
    });

    const results = response.data;
    if (results.length > 0) {
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setMessage("Няма намерени места.");
      setSuccess(false);
      setSuggestions([]);
      setShowSuggestions(false);
      setTimeout(() => setMessage(""), 3000);
    }
  } catch (error) {
    console.error("Error searching place", error);
    setMessage("Грешка при търсенето на място.");
    setSuccess(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => setMessage(""), 3000);
  }
};

const handleSelectSuggestion = (suggestion) => {
  const location = {
    lat: parseFloat(suggestion.lat),
    lng: parseFloat(suggestion.lon),
  };
  setPlaceName(suggestion.display_name.split(",")[0]);
  setSelectedLocation(location);
  setSelectedPlaceId(suggestion.osm_id);
  setSelectedAddress(suggestion.display_name);
  setSuggestions([]);
  setShowSuggestions(false);

  if (mapRef.current) {
    mapRef.current.setView(location, 14);
  }
};

  const handleSubmit = async () => {
    if (!placeName || !selectedLocation || !numberInNationalList) {
      setMessage("Моля, попълнете всички задължителни полета!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const payload = {
        name: placeName,
        google_external_id: selectedPlaceId,
        description,
        location: selectedLocation,
        numberInNationalList,
        isActive,
        address: selectedAddress
      };

      if (editMode) {
        await axios.put(`${backendUrl}/nationalSites/updateNationalSite/${placeId}`, payload);
        const updatedSitesResponse = await axios.get(`${backendUrl}/nationalSites/getAllNationalSites`);
        setPlaces(updatedSitesResponse.data);
        const newPlace = updatedSitesResponse.data[updatedSitesResponse.data.length - 1];
        navigate(`/admin/national-sites/${placeId}`);
        setIsModalOpen(false);
        setIsModalOpenSuccess(newPlace);
      } else {
        await axios.post(`${backendUrl}/nationalSites/addNationalSite`, {
            adminId: user.id,
            nationalSiteData: payload,
          });
        const updatedSitesResponse = await axios.get(`${backendUrl}/nationalSites/getAllNationalSites`);
        setPlaces(updatedSitesResponse.data);
        const newSite = updatedSitesResponse.data[updatedSitesResponse.data.length - 1];
        navigate(`/admin/national-sites/${newSite._id}`);
        setIsModalOpen(false);
        setIsModalOpenSuccess(newSite);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Грешка при запис.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      console.error("Error saving national site", error);
    }
  };

    const ClickHandler = () => {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const location = { lat, lng };
      setSelectedLocation(location);

      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            lat,
            lon: lng,
            format: 'json',
            addressdetails: 1,
          },
        });

        const data = response.data;

        if (data) {
          setPlaceName(data.name || data.display_name.split(',')[0]);
          setSelectedAddress(data.display_name);
          setSelectedPlaceId(data.osm_id);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setMessage("Грешка при извличане на адреса.");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
      }
    }
  });

  return null;
};

  return (
    <Modal
      isOpen
      onRequestClose={() => setIsModalOpen(false)}
      className="modal-container add-place-modal"
    >
      <div className="modal-content">
        <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>

        <h2>{editMode ? "Редактиране" : "Добавяне"}</h2>

        {/* <div className="input-wrapper">
        <input
          type="text"
          placeholder="№"
          value={numberInNationalList}
          onChange={(e) => setNumberInNationalList(e.target.value)}
          className="modal-input-number"
        />
          <input
            type="text"
            placeholder="Име на обекта"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="modal-input"
          />
          <div className="search-button" onClick={handleSearchPlace}>
            <FaSearch />
          </div>
        </div> */}

        <div className="input-wrapper" style={{ position: "relative" }}>
          <input
          type="text"
          placeholder="№"
          value={numberInNationalList}
          onChange={(e) => setNumberInNationalList(e.target.value)}
          className="modal-input-number"
        />
        <input
          type="text"
          placeholder="Име на обекта"
          value={placeName}
          onChange={(e) => {
            setPlaceName(e.target.value);
            setSuggestions([]);
            setShowSuggestions(false);
          }}
          className="modal-input"
        />
        <div className="search-button" onClick={handleSearchPlace}>
          <FaSearch />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list" style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "200px",
            overflowY: "auto",
            background: "white",
            border: "1px solid #ccc",
            zIndex: 1000,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.osm_id}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{ padding: "8px", cursor: "pointer" }}
                onMouseDown={(e) => e.preventDefault()} 
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>


        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          Активен обект
        </label>

        {center && (
                  <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                    <MapContainer
                      ref={mapRef}
                      center={selectedLocation || center}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                      whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <ClickHandler />
                      {center && <Marker position={center} icon={myLocationIcon} />}
                      {selectedLocation && <Marker position={selectedLocation} />}
                    </MapContainer>
        
                    <button
                      onClick={centerToMyLocation}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 1000,
                        padding: '8px 10px',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        boxShadow: '0 1px 5px rgba(0,0,0,0.3)'
                      }}
                    >
                      📍
                    </button>
                  </div>
                )}

        <textarea
          placeholder="Описание на обекта (не е задължително)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-input description-textarea"
          rows="4"
        />

        {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}

        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSubmit}>
            {editMode ? "Запази" : "Добави"}
          </button>
          <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Отказ</button>
        </div>
      </div>
    </Modal>
  );
};

export default AddNationalSiteModal;
