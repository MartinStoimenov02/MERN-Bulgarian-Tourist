import mongoose from 'mongoose';

const UserScheme = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "name is required."],
    },
    email: {
        type: String,
        required:[true, "email is required."],
        unique: [true, "email must be unique"]
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleAuth; // Required only for non-Google users
        },
        minlength: [8, "Your password must be 8 characters or longer."],
    },
    phoneNumber: {
        type: String,
        // required:[true, "phone number is required."],
        unique: [true, "phone number must be unique"],
        sparse: true, //Позволява няколко документа да нямат стойност (null или undefined) за това поле, без да нарушава уникалността
        set: function (val) {
            return val && val.trim() !== "" ? val : undefined;  // ✅ Remove field if empty
        },
    },
    points: {
        type: Number,
        default: 0
    },
    firstLogin: {
        type: Boolean,
        default: true
    },
    isGoogleAuth: {
        type: Boolean,
        default: false, // Track whether the user signed up with Google
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {timestamps:true});

const UserModel = mongoose.model("user", UserScheme);

export default UserModel;