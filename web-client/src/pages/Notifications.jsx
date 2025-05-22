import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/NotificationsStyle.css';  

const Notifications = ({ setHasUnreadNotifications }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get('http://'+host+':'+port+'/notifications/getNotificationsForUser', {
            params: { userId: user.id }
          }); 
          setNotifications(response.data.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchNotifications();
    }
  }, [user, host, port]);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.patch('http://'+host+':'+port+'/notifications/markAsRead', {
         notificationId: notificationId
      });
      setNotifications((prevNotifications) => {
        const updated = prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );

        // Проверка дали всички са прочетени
        const allRead = updated.every((n) => n.isRead);
        setHasUnreadNotifications(!allRead); // Обновява Header-а

        return updated;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="notification-container">
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div
            key={index}
            className={`notificationCard ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification._id)}
          >
            <div
              className={`message ${!notification.isRead ? 'boldMessage' : ''}`}
            >
              {notification.message}
            </div>
            <div className="date">{formatDate(notification.createdAt)}</div>
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
