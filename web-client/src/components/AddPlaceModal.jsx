import React, { useState } from "react";
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

const AddPlaceModal = ({ setIsModalOpen, userEmail, setPlaces, setIsModalOpenSuccess }) => {
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [description, setDescription] = useState(""); 
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();


  // Handle Map click to update location
  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setSelectedPlaceId(event.placeId);
  };

  // Search location using geocoding
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

  // Add place handler
  const handleAddPlace = async () => {
    if (!placeName || !selectedLocation) {
      setMessage("Моля, въведете име и изберете локация!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }  
    try {
      // Make the API request to add the place
      const response = await axios.post("http://localhost:3001/places/addPlace", {
        name: placeName,
        google_external_id: selectedPlaceId,
        email: userEmail,
        description: description,
        location: selectedLocation
      });
  
      // Notify the parent component to refresh the places list
      const updatedPlacesResponse = await axios.get("http://localhost:3001/places/getUserPlaces", {
        params: { email: userEmail }
      });
  
      // Update the places in the parent component
      setPlaces(updatedPlacesResponse.data);
  
      // Assuming the newly added place is at the end of the places array
      const newPlace = updatedPlacesResponse.data[updatedPlacesResponse.data.length - 1];
  
      // Use the navigate function to open the new place's details page
      navigate(`/my-places/${newPlace._id}`); // Assuming the URL for place details looks like "/places/{placeId}"
  
      // Close the modal and show success message
      setIsModalOpen(false);
      setIsModalOpenSuccess(true);
    } catch (error) {
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

        {/* Place name input with search icon */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Име на мястото"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="modal-input"
          />
          <button className="search-icon" onClick={handleSearchPlace}>
            <FaSearch />
          </button>
        </div>

        {/* Google map */}
        <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedLocation || center} // Use selected location if exists
            zoom={14}
            onClick={handleMapClick}
            options={{
              zoomControl: true,
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: true,
            }}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
          </GoogleMap>
        </LoadScriptNext>

        {/* Description TextBox */}
        <textarea
          placeholder="Описание на мястото (не е задължително)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-input description-textarea"
          rows="4"
        />
        {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
        {/* Buttons */}
        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleAddPlace}>Добави</button>
          <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Отказ</button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPlaceModal;
