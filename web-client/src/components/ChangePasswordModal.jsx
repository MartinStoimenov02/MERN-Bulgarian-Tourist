import React, { useState } from "react";
import "../style/ChangePasswordModal.css";
import Axios from "axios";

import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const ChangePasswordModal = ({ isOpen, onClose, email, setChangedPasswordSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };
  

  const handleChange = async (e) => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage("Моля, попълнете всички полета.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage("Паролата трябва да е поне 8 символа и да съдържа главна, малка буква и цифра.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("Новата парола не съвпада!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    const formData = {
      email: email,
      password: currentPassword
    }
    
    try {
          const res = await Axios.post(`${backendUrl}/users/getUser`, formData);
          if (res.data.success) {
            const password = newPassword;
            const resetPassword = await Axios.post(`${backendUrl}/users/resetPassword`, {
              email,
              password,
            });
      
            if (resetPassword.data.success) {
              setChangedPasswordSuccess(true);
            } else {
              setMessage("Грешка при промяна на паролата.");
              setSuccess(false);
              setTimeout(() => setMessage(""), 3000);
            }
          } else {
            setMessage("Невалидна текуща парола!");
            setSuccess(false);
            setTimeout(() => setMessage(""), 3000);
            return;
          }
        } catch (error) {
          console.error("error: ", error);
          setMessage(error.response?.data?.message || "Грешка!");
          setSuccess(false);
          setTimeout(() => setMessage(""), 3000);
          return;
        }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay change-password-modal">
      <div className="modal-content">
        <h2>Смяна на парола</h2>
        <div className="password-container">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Текуща парола"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="modal-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowCurrent(!showCurrent)}
          >
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="password-container">
          <input
            type={showNew ? "text" : "password"}
            placeholder="Нова парола"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="modal-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="password-container">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Повтори новата парола"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="modal-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>
        {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}

        <div className="modal-buttons">
          <button onClick={handleChange} className="btn-primary-change-password">Потвърди</button>
          <button className="btn-cancel-change-password" onClick={handleClose}>Затвори</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
