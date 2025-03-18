import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  datetime: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const NotificationModel = mongoose.model('notification', NotificationSchema);

export default NotificationModel;
