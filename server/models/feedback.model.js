import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required:[true, "user is required."]
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
