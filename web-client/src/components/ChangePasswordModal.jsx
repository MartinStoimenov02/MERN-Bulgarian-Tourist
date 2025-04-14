import React, { useState } from "react";
import "../style/ChangePasswordModal.css";
import Axios from "axios";

import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const ChangePasswordModal = ({ isOpen, onClose, email }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  const handleClose = () => {
    // Clear all fields and messages
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
          const res = await Axios.post("http://"+host+":"+port+"/users/getUser", formData);
          if (res.data.success) {
            console.log("res.data.user: ", res.data.user);
            console.log("newPassword: ", newPassword);
            const password = newPassword;
            const resetPassword = await Axios.post("http://"+host+":"+port+"/users/resetPassword", {
              email,
              password,
            });
      
            if (resetPassword.data.success) {
              setMessage("Паролата е променена успешно! Пренасочване към вход...");
              setSuccess(true);
              setTimeout(() => setMessage(""), 3000);
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

    // TODO: Викай API-то за смяна на парола тук
    console.log("Промяна на парола:", { email, currentPassword, newPassword });

    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay change-password-modal">
      <div className="modal-content">
        <h2>Смяна на парола</h2>
        {/* Текуща парола */}
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

        {/* Нова парола */}
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

        {/* Потвърди новата парола */}
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
          <button onClick={handleChange} className="confirm-btn">Потвърди</button>
          <button className="btn-cancel" onClick={handleClose}>Затвори</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
