import NationalSiteModel from "../models/nationalSites.model.js";
import axios from "axios";
import PlaceModel from "../models/place.model.js";

// Get all places for a specific user
export const getActiveNationalSites = async (req, res) => {
  try {
    const nationalSites = await NationalSiteModel.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "places",            // Make sure this matches the actual collection name for places
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
    console.error("Error fetching national sites", error);
    res.status(500).json({ message: "Error fetching national sites", error });
  }
};

export const addNationalSiteToMyList = async (req, res) => {
  console.log("addNationalSiteToMyList");
  console.log("req.body: ", req.body);
  try {
    const { nationalSite, email } = req.body;
    console.log("nationalSite: ", nationalSite);
    console.log("email: ", email);
    const { _id, name, description, imgPath, isActive, numberInNationalList, google_external_id, location } = nationalSite;
    console.log("_id: ", _id);
    console.log("name: ", name);
    console.log("description: ", description);
    console.log("imgPath: ", imgPath);
    console.log("isActive: ", isActive);
    console.log("numberInNationalList: ", numberInNationalList);
    console.log("google_external_id: ", google_external_id);
    console.log("location: ", location);
    const locationParsed = {
      lat: parseFloat(location?.lat),
      lng: parseFloat(location?.lng)
    };
    console.log("locationParsed: ", locationParsed);

    const newPlace = new PlaceModel({
          name: name,
          description: description,
          imgPath: imgPath,
          location: locationParsed,
          userEmail: email,
          nto100: _id,
          google_external_id: google_external_id
  });
    console.log("newPlace: ", newPlace);
    const savedNewPlace = await newPlace.save();
    res.status(201).json({
      message: 'Place added successfully!',
      site: savedNewPlace,
    });
  } catch (error) {
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
    console.log("newNationalSite: ", newNationalSite);
    const savedNationalSite = await newNationalSite.save();
    res.status(201).json({
      message: 'National site added successfully!',
      site: savedNationalSite,
    });
  } catch (error) {
    console.error('Error adding national site:', error);
    res.status(500).json({
      message: 'Failed to add national site.',
      error: error.message,
    });
  }
};