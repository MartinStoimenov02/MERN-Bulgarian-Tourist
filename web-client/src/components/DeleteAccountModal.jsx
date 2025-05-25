import React, { useState } from "react";
import "../style/DeleteAccountModal.css";
import Axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DeleteAccountModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleDelete = async () => {
    if (confirmEmail !== user.email) {
      setMessage("Email-ът не съвпада!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (user.hasPassword && !password) {
      setMessage("Моля въведете парола!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      var res;
      if(user.hasPassword){
        const formData = {
          email: user.email,
          password: password
        };
        res = await Axios.post(`${backendUrl}/users/getUser`, formData);
      } else if (!user.hasPassword || user.isGoogleAuth) {
        const userData = { 
          email: user.email
        };
        res = await Axios.post(`${backendUrl}/users/googleAuth`, { userData });
      }

      if (res.data.success) {
        const deleteRes = await Axios.post(
          `${backendUrl}/users/deleteAccount`,
          { userId: user.id }
        );

        if (deleteRes.data.success) {
          onSuccess();
          onClose();
          setConfirmEmail("");
          setPassword("");
        } else {
          setMessage("Грешка при изтриване на акаунта.");
          setSuccess(false);
          setTimeout(() => setMessage(""), 3000);
        }
      } else {
        setMessage(res.data.message);
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
        return;
      }
    } catch (error) {
      console.error("Error: ", error);
      setMessage(error.response?.data?.message || "Грешка!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay delete-account-modal">
      <div className="modal-content">
        <h2>Изтриване на акаунт</h2>
        <input
          type="email"
          placeholder="Email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="modal-input"
        />

        {user.hasPassword && (
          <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          <button 
            type="button" 
            className="password-toggle" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />} 
          </button>
        </div>
        )}

        {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}

        <div className="modal-buttons">
          <button className="btn-primary-delete-account" onClick={handleDelete}>Изтрий</button>
          <button className="btn-cancel-delete-account" onClick={onClose}>Отказ</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
