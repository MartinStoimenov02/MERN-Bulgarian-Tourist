import NotificationModel from '../models/notification.model.js';
import UserNotificationModel from '../models/userNotification.model.js';
import UserModel from '../models/user.model.js';
import logError from '../utils/logger.js';

export const addNotification = async (req, res, next) => {
  const { message, adminId } = req.body;

  try {
    const user = await UserModel.findById( adminId );

    if(!user.isAdmin){
      res.status(403).json({
        success: false,
        message: 'Достъп отказан!',
      });
    }

    const newNotification = new NotificationModel({ message });
    await newNotification.save();

    res.status(201).json({
      success: true,
      message: 'Notification added successfully!',
      data: newNotification
    });
  } catch (err) {
    next(err);
    logError(err, req, { className: 'notification.controller', functionName: 'addNotification' });
    console.error("Error adding notification: ", err);
    res.status(500).json({
      success: false,
      message: 'Error adding notification!',
    });
  }
};

export const addUserNotification = async (req, res, next) => {
  const { adminId, userId, notificationId } = req.body;

  try {
    const user = await UserModel.findById( adminId );

    if(!user.isAdmin){
      res.status(403).json({
        success: false,
        message: 'Достъп отказан!',
      });
    }

    // Create a new junction record
    const userNotification = await UserNotificationModel.create({
      user: userId,
      notificationId,
    });

    res.status(201).json({
      success: true,
      message: 'User and Notification linked successfully!',
      data: userNotification,
    });
  } catch (error) {
    next(error);
    logError(err, req, { className: 'notification.controller', functionName: 'addUserNotification', user: req.body.userId });
    console.error("Error adding user notification: ", err);
    res.status(500).json({
      success: false,
      message: 'Error adding user notification!',
    });
  }
};

export const getNotificationsForUser = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const userNotifications = await UserNotificationModel
      .find({ user: userId })
      .populate('notificationId') //Заменя notificationId с пълния документ от свързаната колекция (например NotificationModel)
      .exec();

    const unreadNotifications = userNotifications
      .filter(uns => !uns.isRead) 
      .sort((a, b) => new Date(a.notificationId.createdAt) - new Date(b.notificationId.createdAt));

    const readNotifications = userNotifications
      .filter(uns => uns.isRead)  
      .sort((a, b) => new Date(a.notificationId.createdAt) - new Date(b.notificationId.createdAt));

    const allNotifications = [...unreadNotifications, ...readNotifications];
    res.status(201).json({
      success: true,
      message: 'User and Notification linked successfully!',
      data: allNotifications.map(uns => ({
        _id: uns._id, 
        message: uns.notificationId.message,
        createdAt: uns.notificationId.createdAt,
        isRead: uns.isRead,
      })),
    });
  } catch (err) {
    logError(err, req, { className: 'notification.controller', functionName: 'getNotificationsForUser', user: req.query.userId });
    console.error('Error fetching notifications:', err);
    throw new Error('Failed to fetch notifications');
  }
};

export const markAsRead = async (req, res, next) => {
  const { notificationId } = req.body;
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
    logError(err, req, { className: 'notification.controller', functionName: 'markAsRead' });
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read!',
    });
  }
};
