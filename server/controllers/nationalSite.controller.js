import NationalSiteModel from "../models/nationalSites.model.js";
import axios from "axios";
import PlaceModel from "../models/place.model.js";
import UserModel from "../models/user.model.js";
import logError from '../utils/logger.js';
import { getRandomImageHelper } from "../controllers/place.controller.js";

export const getActiveNationalSites = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const nationalSites = await NationalSiteModel.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "places",
          let: { nationalSiteId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$nto100", "$$nationalSiteId"] },
                    { $eq: ["$user", { $toObjectId: userId }] }
                  ]
                }
              }
            }
          ],
          as: "userPlaces"
        }
      },
      {
        $match: {
          userPlaces: { $eq: [] }
        }
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

    const places = await NationalSiteModel.find();
    const alreadyExists = places.some(place => place.google_external_id === nationalSiteData.google_external_id);

    if (alreadyExists) {
      return res.status(400).json({ message: "Мястото вече е добавено." });
    }

    var imgPath;
    // const imageResponse = await getRandomImageHelper(name);
    // if (!imageResponse || !imageResponse.imageUrl) {
      imgPath = "https://www.interregeurope.eu/sites/default/files/styles/banner_image/public/good_practices/good_practice__3419__1581074278.jpg?itok=mM0rtKr7";
    // } else{
    //   imgPath = imageResponse.imageUrl;
    // }

    nationalSiteData.imgPath = imgPath;

    const newNationalSite = new NationalSiteModel(nationalSiteData);
    const savedNationalSite = await newNationalSite.save();

    res.status(201).json({
      message: 'National site added successfully!',
      site: savedNationalSite,
    });
  } catch (error) {
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
  const { name, description, location, google_external_id, numberInNationalList, isActive, address } = req.body;

  try {
    var imgPath;
    // const imageResponse = await getRandomImageHelper(name);
    // if (!imageResponse || !imageResponse.imageUrl) {
      imgPath = "https://www.interregeurope.eu/sites/default/files/styles/banner_image/public/good_practices/good_practice__3419__1581074278.jpg?itok=mM0rtKr7";
    // } else{
    //   imgPath = imageResponse.imageUrl;
    // }

    const nationalSite = await NationalSiteModel.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        location, 
        google_external_id, 
        numberInNationalList, 
        isActive,
        imgPath, 
        address
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
