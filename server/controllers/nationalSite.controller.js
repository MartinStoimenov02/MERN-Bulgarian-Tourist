import NationalSiteModel from "../models/nationalSites.model.js";
import axios from "axios";
import PlaceModel from "../models/place.model.js";
import UserModel from "../models/user.model.js";
import logError from '../utils/logger.js';
import { getRandomImageHelper } from "../controllers/place.controller.js";

export const getActiveNationalSites = async (req, res) => {
  try {
    const nationalSites = await NationalSiteModel.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "places",
          localField: "_id",
          foreignField: "nto100",
          as: "referencingPlaces"
        }
      },
      {
        // Only keep national sites that are not referenced in any place
        $match: { referencingPlaces: { $eq: [] } }
      }
    ]);

    res.status(200).json(nationalSites);
  } catch (error) {
    next(err);
    logError(error, req, { className: 'nationalSite.controller', functionName: 'getActiveNationalSites' });
    console.error("Error fetching national sites", error);
    res.status(500).json({ message: "Error fetching national sites", error });
  }
};

export const deleteNationalSite = async (req, res) => {
  try {
    const { placeId } = req.body;
    const deletedPlace = await NationalSiteModel.findByIdAndDelete(placeId);
    if (!deletedPlace) return res.status(404).json({ message: "Place not found" });

    res.status(200).json({ message: "Place deleted successfully" });
  } catch (error) {
    next(err);
    logError(error, req, { className: 'place.controller', functionName: 'deletePlace' });
    console.error("Error deleting place:", error);
    res.status(500).json({ message: "Error deleting place", error });
  }
};

export const getAllNationalSites = async (req, res) => {
  try {
    const allNationalSites = await NationalSiteModel.find();

    res.status(200).json(allNationalSites);
  } catch (error) {
    next(err);
    logError(error, req, { className: 'nationalSite.controller', functionName: 'getAllNationalSites' });
    console.error("Error fetching national sites", error);
    res.status(500).json({ message: "Error fetching national sites", error });
  }
};

export const addNationalSiteToMyList = async (req, res) => {
  try {
    const { nationalSite, userId } = req.body;
    const { _id, name, description, imgPath, isActive, numberInNationalList, google_external_id, location } = nationalSite;
    const locationParsed = {
      lat: parseFloat(location?.lat),
      lng: parseFloat(location?.lng)
    };
    const newPlace = new PlaceModel({
          name: name,
          description: description,
          imgPath: imgPath,
          location: locationParsed,
          user: userId,
          nto100: _id,
          google_external_id: google_external_id
  });
    const savedNewPlace = await newPlace.save();
    res.status(201).json({
      message: 'Place added successfully!',
      site: savedNewPlace,
    });
  } catch (error) {
    next(err);
    logError(error, req, { className: 'nationalSite.controller', functionName: 'addNationalSiteToMyList', user: req.body.userId });
    console.error('Error adding place:', error);
    res.status(500).json({
      message: 'Failed to add place.',
      error: error.message,
    });
  }
};

export const addNationalSite = async (req, res) => {
  try {
    const { adminId, nationalSiteData } = req.body;

    const user = await UserModel.findById(adminId);
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Достъп отказан!',
      });
    }

    const imageResponse = await getRandomImageHelper(nationalSiteData.name);
    if (!imageResponse || !imageResponse.imageUrl) {
      return res.status(500).json({ message: "Неуспешно извличане на снимка" });
    }
    nationalSiteData.imgPath = imageResponse.imageUrl;

    const newNationalSite = new NationalSiteModel(nationalSiteData);
    const savedNationalSite = await newNationalSite.save();

    res.status(201).json({
      message: 'National site added successfully!',
      site: savedNationalSite,
    });
  } catch (error) {
    next(err);
    logError(error, req, { className: 'nationalSite.controller', functionName: 'addNationalSite' });
    console.error('Error adding national site:', error);
    res.status(500).json({
      message: 'Failed to add national site.',
      error: error.message,
    });
  }
};


export const updateNationalSite = async (req, res) => {
  const { id } = req.params;
  const { name, description, location, google_external_id, numberInNationalList, isActive } = req.body;

  try {
    const nationalSite = await NationalSiteModel.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        location, 
        google_external_id, 
        numberInNationalList, 
        isActive 
      },
      { new: true }
    );

    if (!nationalSite) {
      return res.status(404).json({ message: "Националният обект не е намерен." });
    }

    res.json(nationalSite);
  } catch (err) {
    next(err);
    logError(err, req, { className: 'nationalSite.controller', functionName: 'updateNationalSite' });
    console.error('Error updateNationalSite:', err);
    res.status(500).json({ message: "Неуспешна редакция на национален обект." });
  }
};
