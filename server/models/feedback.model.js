import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required:[true, "userEmail is required."]
    },
    feedbackType: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    }
}, {timestamps: true});

const FeedbackModel = mongoose.model('feedback', FeedbackSchema);

export default FeedbackModel;
