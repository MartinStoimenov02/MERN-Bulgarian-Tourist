import NationalSiteModel from "../models/nationalSites.model.js";
import axios from "axios";
import PlaceModel from "../models/place.model.js";
import logError from '../utils/logger.js';

// Get all places for a specific user
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
    logError(err, req, { className: 'nationalSite.controller', functionName: 'getActiveNationalSites' });
    console.error("Error fetching national sites", error);
    res.status(500).json({ message: "Error fetching national sites", error });
  }
};

export const addNationalSiteToMyList = async (req, res) => {
  try {
    const { nationalSite, email } = req.body;
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
          userEmail: email,
          nto100: _id,
          google_external_id: google_external_id
  });
    const savedNewPlace = await newPlace.save();
    res.status(201).json({
      message: 'Place added successfully!',
      site: savedNewPlace,
    });
  } catch (error) {
    logError(err, req, { className: 'nationalSite.controller', functionName: 'addNationalSiteToMyList' });
    console.error('Error adding place:', error);
    res.status(500).json({
      message: 'Failed to add place.',
      error: error.message,
    });
  }
};

export const addNationalSite = async (req, res) => {
  try {
    const newNationalSite = new NationalSiteModel(req.body);
    const savedNationalSite = await newNationalSite.save();
    res.status(201).json({
      message: 'National site added successfully!',
      site: savedNationalSite,
    });
  } catch (error) {
    logError(err, req, { className: 'nationalSite.controller', functionName: 'addNationalSite' });
    console.error('Error adding national site:', error);
    res.status(500).json({
      message: 'Failed to add national site.',
      error: error.message,
    });
  }
};