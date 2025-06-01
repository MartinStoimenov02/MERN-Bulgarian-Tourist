import PlaceModel from "../models/place.model.js";
import NationalSiteModel from "../models/nationalSites.model.js";
import axios from "axios";
import logError from '../utils/logger.js';

export const getUserPlaces = async (req, res) => {
  try {
    const { userId, visited } = req.query; 
    if (!userId) {
      throw new Error("User ID is required to fetch places.");
    }
    const places = await PlaceModel.find({ user: userId, isVisited: visited });
    res.status(200).json(places);
  } catch (error) {
    next(err);
    logError(error, req, { className: 'place.controller', functionName: 'getUserPlaces', user: userId });
    console.error("Error fetching place: ", error);
    res.status(500).json({ message: "Error fetching places", error });
  }
};

export const getPlaceById = async (req, res) => {
  try {
    const place = await PlaceModel.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    res.status(200).json(place);
  } catch (error) {
    next(err);
    logError(error, req, { className: 'place.controller', functionName: 'getPlaceById' });
    console.error("Error fetching place:", error);
    res.status(500).json({ message: "Error fetching place", error });
  }
};

export const addPlace = async (req, res) => {
  try {
    const { name, google_external_id, userId, description, location, address } = req.body; 
    const places = await PlaceModel.find({ user: userId });
    const alreadyExists = places.some(place => place.google_external_id === String(google_external_id));
    if (alreadyExists) {
      return res.status(400).json({ message: "Мястото вече е добавено." });
    }

    var imgPath;
    const imageResponse = await getRandomImageHelper(name);
    if (!imageResponse || !imageResponse.imageUrl) {
      imgPath = "https://www.interregeurope.eu/sites/default/files/styles/banner_image/public/good_practices/good_practice__3419__1581074278.jpg?itok=mM0rtKr7";
    } else{
      imgPath = imageResponse.imageUrl;
    }

    console.log("google_external_id: ", google_external_id);

    const nationalSites = await NationalSiteModel.find({ isActive: true });
    const matchingSite = nationalSites.find(site => site.google_external_id === String(google_external_id));
    console.log("nationalSites: ", nationalSites);
    console.log("matchingSite: ", matchingSite);

    const newPlace = new PlaceModel({
      name,
      imgPath,
      description,
      user: userId,
      google_external_id: google_external_id, 
      location: location,
      nto100: matchingSite ? matchingSite._id : undefined,
      address: address
    });

    await newPlace.save();
    res.status(201).json({ message: "Place added successfully", place: newPlace });
  } catch (error) {
    next(err);
    logError(error, req, { className: 'place.controller', functionName: 'addPlace', user: req.body.userId });
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Error adding place", error });
  }
};

export const deletePlace = async (req, res) => {
  try {
    const { placeId } = req.body;
    const deletedPlace = await PlaceModel.findByIdAndDelete(placeId);
    if (!deletedPlace) return res.status(404).json({ message: "Place not found" });

    res.status(200).json({ message: "Place deleted successfully" });
  } catch (error) {
    next(err);
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
    next(err);
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
    next(err);
    logError(error, req, { className: 'place.controller', functionName: 'updateFavourite' });
    console.error("Failed to update favourite status: ", error);
    res.status(500).json({ error: "Failed to update favourite status" });
  }
};

export const getRandomImageHelper = async (query) => {
  try {
    const res = await axios.get("https://api.unsplash.com/search/photos", {
          params: {
            query: `${query}`,
            // query: "Bulgarian nature and culture",
            client_id: "qHq1ytJzFs1mGrKLVagNoPSxc__JtazBpxlKfjnALKE"
          }
        });
        const images = res.data.results;
        if (images.length > 0) {
          const landscapeImages = images.filter(item => item.width > item.height);
          if (landscapeImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * landscapeImages.length);
            const randomImage = landscapeImages[randomIndex];
            return { imageUrl: randomImage.urls.regular };
          }
        }
    return null;
  } catch (error) {
    logError(error, { className: 'place.controller', functionName: 'getRandomImageHelper' });
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Error fetching image" });
  }
};

export const updatePlace = async (req, res) => {
  const { id } = req.params;
  const { name, description, location, google_external_id, address } = req.body;
  
  try {
    var imgPath;
    const imageResponse = await getRandomImageHelper(name);
    if (!imageResponse || !imageResponse.imageUrl) {
      imgPath = "https://www.interregeurope.eu/sites/default/files/styles/banner_image/public/good_practices/good_practice__3419__1581074278.jpg?itok=mM0rtKr7";
    } else{
      imgPath = imageResponse.imageUrl;
    }

    const nationalSites = await NationalSiteModel.find({ isActive: true });
    const matchingSite = nationalSites.find(site => site.google_external_id === google_external_id);

    const place = await PlaceModel.findByIdAndUpdate(
      id,
      { name, description, imgPath, location, google_external_id, nto100: matchingSite ? matchingSite._id : undefined, address },
      { new: true }
    );
    res.json(place);
  } catch (err) {
    next(err);
    logError(err, req, { className: 'place.controller', functionName: 'updatePlace' });
    console.error("Error update Place:", error);
    res.status(500).json({ message: "Неуспешна редакция на място." });
  }
};
