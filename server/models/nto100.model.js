import mongoose from 'mongoose';

const NTO100Scheme = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "name is required."]
    },
    description: {
        type: String,
        required:[true, "description is required."]
    },
    imgPath: {
        type: String,
        required:[true, "mapUrl number is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    numberInNationalList: {
        type: String,
        required:[true, "numberInNationalList is required."]
    },
    google_external_id: {
        type: String
    },
}, {timestamps:true});

const NTO100Model = mongoose.model("nto100s", NTO100Scheme);

export default NTO100Model;