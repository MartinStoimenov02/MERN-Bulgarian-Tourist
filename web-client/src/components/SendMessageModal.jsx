import React, { useState } from 'react';
import '../style/SendMessageModal.css'; 
import axios from 'axios';

const SendMessageModal = ({ currentUser, selectedUserIds, onClose, onSuccess }) => {
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSend = async () => {
    try {
        const { data: notifData } = await axios.post(`${backendUrl}/notifications/addNotification`, {
            message: notificationMessage,
            adminId: currentUser.id,
        });
    
        if (!notifData.success) {
          throw new Error('Failed to create notification');
        }

        const notificationId = notifData.data._id; 
    
        for (const userId of selectedUserIds) {
          await axios.post(`${backendUrl}/notifications/addUserNotification`, {
            adminId: currentUser.id,
            userId: userId,
            notificationId: notificationId,
          });

          if(sendEmail){
            await axios.post(`${backendUrl}/email/sendNotificationEmail`, {
                adminId: currentUser.id,
                userId: userId,
                notificationMessage: notificationMessage,
              });
          }
        }
        onSuccess();
        onClose(); 
      } catch (err) {
        console.error('Error sending notifications:', err);
        setMessage("Грешка при изпращане на съобщението!");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
      }
  };

  return (
    <div className="send-notification-backdrop">
      <div className="send-notification-modal">
        <h2>Изпрати съобщение</h2>
        <textarea
          rows="5"
          placeholder="Въведи съобщение..."
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Изпрати и по имейл
        </label>
        <div className="send-notification-modal-buttons">
          <button onClick={handleSend}>Изпрати</button>
          <button onClick={onClose}>Отказ</button>
        </div>
      </div>

      {message && (
        <p className={success ? "success-message" : "error-message"}>
          {message}
        </p>
      )}
    </div>
  );  
};

export default SendMessageModal;
