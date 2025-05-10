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

const AddNationalSiteModal = ({ setIsModalOpen, user, setPlaces, setIsModalOpenSuccess, placeId, initialData, editMode }) => {
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [numberInNationalList, setNumberInNationalList] = useState("");
  const [isActive, setIsActive] = useState(true);

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

  useEffect(() => {
    console.log("initialData: ", initialData);
    if (editMode && initialData) {
      setPlaceName(initialData.name || "");
      setDescription(initialData.description || "");
      setSelectedLocation(initialData.location || null);
      setSelectedPlaceId(initialData.google_external_id || null);
      setNumberInNationalList(initialData.numberInNationalList || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [editMode, initialData]);

  const handleMapClick = async (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });

    const externalId = event.placeId;
    setSelectedPlaceId(externalId);

    if (externalId) {
      try {
        const response = await axios.post(`http://${host}:${port}/google/place-details`, {
          externalId
        });
        const placeName = response.data.name;
        setPlaceName(placeName);
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
      }
    } catch (error) {
      console.error("Error searching place", error);
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
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
      };

      if (editMode) {
        await axios.put(`http://${host}:${port}/nationalSites/updateNationalSite/${placeId}`, payload);
        const updatedSitesResponse = await axios.get(`http://${host}:${port}/nationalSites/getAllNationalSites`);
        setPlaces(updatedSitesResponse.data);
        navigate(`/admin/national-sites/${placeId}`);
        setIsModalOpen(false);
        setIsModalOpenSuccess(initialData);
      } else {
        console.log("payload: ", payload);
        console.log("user: ", user);

        const response = await axios.post(`http://${host}:${port}/nationalSites/addNationalSite`, {
            adminId: user.id,
            nationalSiteData: payload,
          });
        console.log("response: ", response);
        const updatedSitesResponse = await axios.get(`http://${host}:${port}/nationalSites/getAllNationalSites`);
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

  return (
    <Modal
      isOpen
      onRequestClose={() => setIsModalOpen(false)}
      className="modal-container add-place-modal"
    >
      <div className="modal-content">
        <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>

        <h2>{editMode ? "Редактиране" : "Добавяне"}</h2>

        <div className="input-wrapper">
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
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          Активен обект
        </label>

        <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedLocation || center}
            zoom={14}
            onClick={handleMapClick}
            onLoad={(map) => {
              mapRef.current = map;

              if (editMode && selectedLocation) {
                map.panTo(selectedLocation);
                map.setZoom(15);
              } else if (navigator.geolocation) {
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

              if (centerButtonRef.current) {
                const controlDiv = document.createElement("div");
                controlDiv.appendChild(centerButtonRef.current);
                map.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
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
