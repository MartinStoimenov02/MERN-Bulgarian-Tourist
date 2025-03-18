import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    
}, {timestamps: true});

const LogModel = mongoose.model('logs', LogSchema);

export default LogModel;
