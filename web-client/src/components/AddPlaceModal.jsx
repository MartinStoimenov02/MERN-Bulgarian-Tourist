import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import { GoogleMap, LoadScriptNext, Marker } from "@react-google-maps/api";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "../style/AddPlaceModal.css";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 42.698334,
  lng: 23.319941,
};

const host = process.env.REACT_APP_HOST;
const port = process.env.REACT_APP_PORT;

const AddPlaceModal = ({ setIsModalOpen, user, setPlaces, setIsModalOpenSuccess }) => {
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const centerButtonRef = useRef(null);

  const handleCenterToUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(userCoords);
          if (mapRef.current) {
            mapRef.current.panTo(userCoords);
            mapRef.current.setZoom(15);
          }
        },
        () => {
          setMessage("Не може да се получи текущата локация.");
        }
      );
    } else {
      setMessage("Геолокацията не се поддържа от браузъра.");
    }
  };

  useEffect(() => {
    if (mapRef.current && centerButtonRef.current) {
      const controlDiv = document.createElement("div");
      controlDiv.appendChild(centerButtonRef.current);
      mapRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    }
  }, [mapRef.current]);

  const handleMapClick = async(event) => {
    console.log("event: ", event);
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });

    const externalId = event.placeId;

    setSelectedPlaceId(externalId);

  if (externalId) {
    try {
      const response = await axios.post("http://"+host+":"+port+"/google/place-details", {
        externalId
      });
      console.log("response.data: ", response.data);
      const placeName = response.data.name; // Името на мястото
      setPlaceName(placeName); // Актуализирай текстовото поле за име
    } catch (error) {
      console.error("Error fetching place details", error);
    }
  }
  };

  const handleSearchPlace = async () => {
    if (!placeName) {
      setMessage("Моля, въведете име на място!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: placeName,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      });
      if (response.data.results.length > 0) {
        const placeId = response.data.results[0].place_id;
        const location = response.data.results[0].geometry.location;
        setSelectedLocation(location);
        setSelectedPlaceId(placeId);
      } else {
        setMessage("Мястото не беше намерено.");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
        return;
      }
    } catch (error) {
      console.error("Error searching place", error);
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }
  };

  const handleAddPlace = async () => {
    if (!placeName || !selectedLocation) {
      setMessage("Моля, въведете име и изберете локация!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      const response = await axios.post("http://" + host + ":" + port + "/places/addPlace", {
        name: placeName,
        google_external_id: selectedPlaceId,
        userId: user.id,
        description: description,
        location: selectedLocation
      });

      const updatedPlacesResponse = await axios.get("http://" + host + ":" + port + "/places/getUserPlaces", {
        params: { userId: user.id, visited: false }
      });

      setPlaces(updatedPlacesResponse.data);
      const newPlace = updatedPlacesResponse.data[updatedPlacesResponse.data.length - 1];
      navigate(`/my-places/${newPlace._id}`);

      setIsModalOpen(false);
      setIsModalOpenSuccess(newPlace);
    } catch (error) {
      setMessage(error.response.data.message);
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      console.error("Error adding place", error);
    }
  };

  return (
    <Modal
      isOpen
      onRequestClose={() => setIsModalOpen(false)}
      className="modal-container add-place-modal"
    >
      <div className="modal-content">
        <button className="close-button" onClick={() => setIsModalOpen(false)}>
          &times;
        </button>

        <h2>Добавяне на място</h2>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Име на мястото"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="modal-input"
          />
          <div className="search-button" onClick={handleSearchPlace}>
            <FaSearch />
          </div>
        </div>

        <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedLocation || center}
            zoom={14}
            onClick={handleMapClick}
            onLoad={(map) => {
              mapRef.current = map;
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const userCoords = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    setCurrentLocation(userCoords);
                    map.panTo(userCoords);
                    map.setZoom(15);
                  },
                  () => {
                    console.warn("Не може да се получи локацията на потребителя.");
                  }
                );
              }
            }}
            options={{
              zoomControl: true,
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: true,
            }}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
            {currentLocation && (
              <Marker
                position={currentLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
          </GoogleMap>

          {/* Вграден бутон вътре в картата */}
          <div ref={centerButtonRef}>
            <button
              onClick={handleCenterToUser}
              style={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "3px",
                padding: "6px 10px",
                margin: "10px",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              📍
            </button>
          </div>
        </LoadScriptNext>

        <textarea
          placeholder="Описание на мястото (не е задължително)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-input description-textarea"
          rows="4"
        />
        {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleAddPlace}>Добави</button>
          <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Отказ</button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPlaceModal;
