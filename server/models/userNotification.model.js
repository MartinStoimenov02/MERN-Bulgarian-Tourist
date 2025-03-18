import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

// Adding a compound index to ensure the combination is unique
userNotificationSchema.index({ userEmail: 1, notificationId: 1 }, { unique: true });

const userNotificationModel = mongoose.model('userNotification', userNotificationSchema);

// Ensure the index is created
userNotificationModel.createIndexes();

export default userNotificationModel;
