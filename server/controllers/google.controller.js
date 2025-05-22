import axios from "axios";
import dotenv from "dotenv";
import logError from '../utils/logger.js';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CX = process.env.GOOGLE_CX;

export const getPlaceDetails = async (req, res) => {

    try {
        const google_external_id = req.body.externalId;
        if (!google_external_id) {
            return res.status(400).json({ message: "'place' е задължително." });
        }

        const googleResponse = await axios.get (
            "https://places.googleapis.com/v1/places/"+google_external_id+"?fields=*&key="+API_KEY
        );


        if (!googleResponse.data) {
            return res.status(404).json({ message: "Мястото не е намерено." });
        }
        const placeDetails = googleResponse.data;
        res.json({
            name: placeDetails.displayName?.text || null,
            address: placeDetails.formattedAddress || null,
            phone: placeDetails.internationalPhoneNumber || null,
            workingHours: placeDetails.regularOpeningHours?.weekdayDescriptions || null,
            rating: placeDetails.rating || null,
            googleMapsUri: placeDetails.googleMapsUri || null
        });

    } catch (error) {
        next(err);
        logError(error, req, { className: 'google.controller', functionName: 'getPlaceDetails' });
        console.error("Грешка при извличане на детайлите за мястото:", error);
        res.status(500).json({ message: "Грешка при обработката на заявката." });
    }
};

export const getDistance = async (req, res) => {
    try {
        const { userLocation, placeLocation } = req.body;
        const userLat = userLocation.latitude;
        const userLng = userLocation.longitude;
        const placeLat = placeLocation.lat;
        const placeLng = placeLocation.lng;

        if (!userLat || !userLng) {
            return res.status(400).json({ message: "Липсват координати на потребителя." });
        }

        if (!placeLat || !placeLng) {
            return res.status(400).json({ message: "Липсват координати на дестинацията." });
        }

        // Изчислява разстоянието с Routes API
        const routesResponse = await axios.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
                origin: {
                    location: {
                        latLng: { latitude: userLat, longitude: userLng }
                    }
                },
                destination: {
                    location: {
                        latLng: { latitude: placeLat, longitude: placeLng }
                    }
                },
                travelMode: "DRIVE"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": API_KEY,
                    "X-Goog-FieldMask": "routes.distanceMeters"
                }
            }
        );

        const distance = routesResponse.data.routes?.[0]?.distanceMeters
            ? `${(routesResponse.data.routes[0].distanceMeters / 1000).toFixed(2)} km`
            : null;
        res.json({ distance });

    } catch (error) {
        next(err);
        logError(error, req, { className: 'google.controller', functionName: 'getDistance' });
        console.error("Грешка при изчисляване на разстоянието:", error);
        res.status(500).json({ message: "Грешка при обработката на заявката." });
    }
};



export const getRandomImage = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required." });
        }

        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&rights=cc_publicdomain,cc_attribute&key=${API_KEY}&cx=${CX}`;
        const response = await axios.get(searchUrl);
        const items = response.data.items;

        if (items && items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            return res.json({ imageUrl: items[randomIndex].link });
        }

        res.status(404).json({ message: "No images found" });
    } catch (error) {
        next(err);
        logError(error, req, { className: 'google.controller', functionName: 'getRandomImage' });
        console.error("Error fetching image:", error);
        res.status(500).json({ message: "Error fetching image" });
    }
};

export const gemini = async (req, res) => {
    try {
        const prompt = req.body.prompt || "Кое е най-доброто място за посещение в България?";

        const geminiResponse = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const text = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            res.json({ response: text });
        } else {
            res.status(404).json({ message: "Не е намерен отговор от модела." });
        }
    } catch (error) {
        next(err);
        logError(error, req, { className: 'google.controller', functionName: 'gemini' });
        console.error("Грешка при заявката към Gemini:", error);
        res.status(500).json({ message: "Грешка при заявката към модела Gemini." });
    }
};