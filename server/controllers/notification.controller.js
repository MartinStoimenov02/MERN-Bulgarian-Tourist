import NotificationModel from '../models/notification.model.js';
import UserNotificationModel from '../models/userNotification.model.js';

export const addNotification = async (req, res, next) => {
  const { message } = req.body;

  try {
    const newNotification = new NotificationModel({ message });
    await newNotification.save();

    res.status(201).json({
      success: true,
      message: 'Notification added successfully!',
    });
  } catch (err) {
    next(err);
    res.status(500).json({
      success: false,
      message: 'Error adding notification!',
    });
  }
};

export const addUserNotification = async (req, res, next) => {
  const { email, notificationId } = req.body;

  try {
    // Create a new junction record
    const userNotification = await UserNotificationModel.create({
      userEmail: email,
      notificationId,
    });

    res.status(201).json({
      success: true,
      message: 'User and Notification linked successfully!',
      data: userNotification,
    });
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: 'Error adding user notification!',
    });
  }
};

export const getNotificationsForUser = async (req, res, next) => {
  const { userEmail } = req.query;
  console.log("userEmail: ", userEmail);

  try {
    // Get the user notifications for the provided email
    const userNotifications = await UserNotificationModel
      .find({ userEmail })
      .populate('notificationId')  // Populate notificationId with the notification data
      .exec();

    // Sort the notifications into two groups: unread and read
    const unreadNotifications = userNotifications
      .filter(uns => !uns.isRead)  // Filter by userNotification isRead field
      .sort((a, b) => new Date(a.notificationId.createdAt) - new Date(b.notificationId.createdAt));

    const readNotifications = userNotifications
      .filter(uns => uns.isRead)  // Filter by userNotification isRead field
      .sort((a, b) => new Date(a.notificationId.createdAt) - new Date(b.notificationId.createdAt));

    // Concatenate unread first, then read
    const allNotifications = [...unreadNotifications, ...readNotifications];
    console.log("allNotifications: ", allNotifications);

    // You can return the full notifications, or just the message part, depending on the requirement.
    res.status(201).json({
      success: true,
      message: 'User and Notification linked successfully!',
      data: allNotifications.map(uns => ({
        _id: uns._id,  // Add userNotification _id to the response
        message: uns.notificationId.message,
        createdAt: uns.notificationId.createdAt,
        isRead: uns.isRead,
      })),
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    throw new Error('Failed to fetch notifications');
  }
};

export const markAsRead = async (req, res, next) => {
  const { notificationId } = req.body;
  console.log("notificationId: ", notificationId);

  try {
    const userNotification = await UserNotificationModel.findById(notificationId);

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: 'User Notification not found!',
      });
    }

    userNotification.isRead = true;
    await userNotification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully!',
      data: userNotification,
    });
  } catch (err) {
    next(err);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read!',
    });
  }
};
