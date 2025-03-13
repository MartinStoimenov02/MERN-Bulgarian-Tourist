import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

// Функция за извличане на детайли за място
export const getPlaceDetails = async (req, res) => {

    try {
        const { place } = req.body;
        if (!place || !place.name) {
            return res.status(400).json({ message: "'place' е задължително." });
        }

        const googleResponse = await axios.get (
            "https://places.googleapis.com/v1/places/"+place.google_external_id+"?fields=*&key="+API_KEY
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
        console.error("Грешка при извличане на детайлите за мястото:", error);
        res.status(500).json({ message: "Грешка при обработката на заявката." });
    }
};

// Функция за изчисляване на разстоянието
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

        // 📌 Изчисляваме разстоянието с Routes API
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

        // 📌 Връщаме разстоянието
        res.json({ distance });

    } catch (error) {
        console.error("Грешка при изчисляване на разстоянието:", error);
        res.status(500).json({ message: "Грешка при обработката на заявката." });
    }
};



export const getRandomImage = async (req, res) => {
    console.log("get random image!");
    try {
        const { query } = req.query; // Get query from request
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required." });
        }

        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=${API_KEY}&cx=${CX}`;
        const response = await axios.get(searchUrl);
        const items = response.data.items;

        if (items && items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            return res.json({ imageUrl: items[randomIndex].link });
        }

        res.status(404).json({ message: "No images found" });
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).json({ message: "Error fetching image" });
    }
};
