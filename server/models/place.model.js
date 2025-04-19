import mongoose from 'mongoose';

const PlaceScheme = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "name is required."]
    },
    description: {
        type: String
    },
    imgPath: {
        type: String
    },
    isVisited: {
        type: Boolean,
        default: false
    },
    isFavourite: {
        type: Boolean,
        default: false
    },
    location: {
        type: Object
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "model.user",
        required:[true, "user is required."]
    },
    nto100: {
        type: mongoose.Types.ObjectId,
        ref: "model.nto100",
    },
    google_external_id: {
        type: String
    },
    dateOfVisit: {
        type: Date
    },
}, {timestamps:true});

const PlaceModel = mongoose.model("places", PlaceScheme);

export default PlaceModel;