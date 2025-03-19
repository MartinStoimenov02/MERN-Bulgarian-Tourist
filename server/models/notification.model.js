import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const NotificationModel = mongoose.model('notification', NotificationSchema);

export default NotificationModel;
