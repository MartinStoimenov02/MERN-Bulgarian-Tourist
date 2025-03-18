import express from 'express';
import { addNotification, addUserNotification, getNotificationsForUser, markAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/addNotification', addNotification);
router.post('/addUserNotification', addUserNotification);
router.get('/getNotificationsForUser', getNotificationsForUser);
router.patch('/markAsRead', markAsRead);

export default router;
