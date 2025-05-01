import PlaceModel from "../models/place.model.js";
import axios from "axios";
import logError from '../utils/logger.js';

// Get all places for a specific user
export const getUserPlaces = async (req, res) => {
  try {
    const { userId, visited } = req.query; 
    console.log("userId: ", userId);
    if (!userId) {
      throw new Error("User ID is required to fetch places.");
    }
    const places = await PlaceModel.find({ user: userId, isVisited: visited });
    res.status(200).json(places);
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'getUserPlaces', user: req.query.userId });
    console.error("Error fetching place: ", error);
    res.status(500).json({ message: "Error fetching places", error });
  }
};

// Get a single place by ID
export const getPlaceById = async (req, res) => {
  try {
    const place = await PlaceModel.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    res.status(200).json(place);
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'getPlaceById' });
    console.error("Error fetching place:", error);
    res.status(500).json({ message: "Error fetching place", error });
  }
};

// Add a new place
export const addPlace = async (req, res) => {
  try {
    const { name, google_external_id, userId, description, location } = req.body; 

    const places = await PlaceModel.find({ user: userId });
    const alreadyExists = places.some(place => place.google_external_id === google_external_id);

    if (alreadyExists) {
      return res.status(400).json({ message: "Мястото вече е добавено." });
    }

    const imageResponse = await getRandomImageHelper(name);
    if (!imageResponse || !imageResponse.imageUrl) {
      return res.status(500).json({ message: "Failed to fetch image" });
    }
    const imgPath = imageResponse.imageUrl;

    const newPlace = new PlaceModel({
      name,
      imgPath,
      description,
      user: userId,
      google_external_id: google_external_id, 
      location: location
    });

    await newPlace.save();
    res.status(201).json({ message: "Place added successfully", place: newPlace });
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'addPlace', user: req.body.userId });
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Error adding place", error });
  }
};

// Delete a place
export const deletePlace = async (req, res) => {
  try {
    const { placeId } = req.body;
    const deletedPlace = await PlaceModel.findByIdAndDelete(placeId);
    if (!deletedPlace) return res.status(404).json({ message: "Place not found" });

    res.status(200).json({ message: "Place deleted successfully" });
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'deletePlace' });
    console.error("Error deleting place:", error);
    res.status(500).json({ message: "Error deleting place", error });
  }
};

export const visitPlace = async (req, res) => {
  try {
    const { placeId, placeDistance } = req.body;
    if(parseFloat(parseFloat(placeDistance))<1){
      await PlaceModel.findByIdAndUpdate(placeId, { isVisited:true, dateOfVisit: new Date() });
      res.status(200).json({ message: "Place visited successfully" }); 
    } else{
      res.status(500).json({ error: "Разстоянието до мястото е повече от 1 км!" });
    }
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'visitPlace' });
    console.error("Failed to visit: ", error);
    res.status(500).json({ error: "Failed to visit" });
  }
};

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

export const updateFavourite = async (req, res) => {
  try {
    const { placeId, isFavourite } = req.body;
    await PlaceModel.findByIdAndUpdate(placeId, { isFavourite });
    res.json({ success: true });
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'updateFavourite' });
    console.error("Failed to update favourite status: ", error);
    res.status(500).json({ error: "Failed to update favourite status" });
  }
};

const getRandomImageHelper = async (query) => {
  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=${API_KEY}&cx=${CX}`;
    const response = await axios.get(searchUrl);
    const items = response.data.items;

    if (items && items.length > 0) {
      // Filter images with landscape orientation (width > height)
      const landscapeImages = items.filter(item => item.image.width > item.image.height);

      if (landscapeImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * landscapeImages.length);
        return { imageUrl: landscapeImages[randomIndex].link };
      }
    }

    return null;
  } catch (error) {
    logError(error, req, { className: 'place.controller', functionName: 'getRandomImageHelper' });
    console.error("Error fetching image:", error);
    return null;
  }
};