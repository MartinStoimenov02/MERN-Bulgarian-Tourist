import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
    },
    errorStatus: {
        type: String
    },
    errorMessage: {
        type: String,
    },
    stackTrace: { 
        type: String, 
        required: true 
    },
    className: {
        type: String,
    },
    functionName: {
        type: String,
    },
    requestData: { 
        type: mongoose.Schema.Types.Mixed, 
        required: false 
    }
}, {timestamps: true});

const LogModel = mongoose.model('logs', LogSchema);

export default LogModel;
