import mongoose from 'mongoose';

const NationalSiteScheme = new mongoose.Schema({
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
        required:[true, "imgPath number is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    numberInNationalList: {
        type: String,
        required:[true, "numberInNationalList is required."]
    },
    location: {
        type: Object
    },
    address: {
        type: String
    },
    google_external_id: {
        type: String
    },
}, {timestamps:true});

const NationalSiteModel = mongoose.model("national-site", NationalSiteScheme);

export default NationalSiteModel;