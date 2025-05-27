import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import FeedbackModal from "../components/FeedbackModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import Axios from "axios";
import "../style/Profile.css";
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/userSlice';


const Profile = () => {
  // const [user, setUser] = useState({ email: "", name: "", phoneNumber: "", password: "", isGoogleAuth: "" });
  const [editedUser, setEditedUser] = useState({ email: "", name: "", phoneNumber: "", password: "", isGoogleAuth: "" });
  const [editingField, setEditingField] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const user = useSelector((state) => state.user.user); 
  const dispatch = useDispatch();

  useEffect(() => {
    // setUserFromSession();
    setEditedUser(user);
  }, []);

  // const setUserFromSession = () => {
  //   const session = localStorage.getItem("userSession");
  //   if (session) {
  //     const parsed = JSON.parse(session);
  //     setUser(parsed);
  //   }
  // };

  const cancelEdit = () => {
  setEditedUser(user);
  setEditingField(null);
};

  const handleFieldChange = (field, value) => {
    // setUser({ ...user, [field]: value });
    setEditedUser({ ...editedUser, [field]: value });
  };

  const validateField = (field, value) => {
    if (field === "phoneNumber" && (value === "" || value===undefined || value===null)) {
      return null;
    }
  
    if (field === "phoneNumber") {
      const phoneNumberRegex = /^[0-9+/]+$/;
      const digitCount = value.replace(/\D/g, "").length;
      if (!phoneNumberRegex.test(value) || digitCount < 10) {
        return "Телефонният номер трябва да съдържа поне 10 цифри и може да има + и /.";
      }
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Моля, въведете валиден имейл адрес.";
      }
    }    

    if (field === "name") {
      if (value === "") {
        return "Името не може да е празно!";
      }
    }
    return null;
  };

  const saveField = async (field) => {
  const validationError = validateField(field, editedUser[field]);
  if (validationError) {
    setMessage(validationError);
    setSuccess(false);
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    const res = await Axios.put(`${backendUrl}/users/updateField`, {
      id: user.id,
      field,
      newValue: editedUser[field],
    });

    if (res.data.success) {
      setMessage("Успешно обновяване!");
      setSuccess(true);
      dispatch(loginSuccess({ ...user, [field]: editedUser[field] }));
      setEditingField(null);
    } else {
      setMessage("Грешка при обновяване.");
      setSuccess(false);
    }
  } catch (error) {
    console.error("update error:", error);
    setMessage(error.response?.data?.message || "Грешка.");
    setSuccess(false);
  }

  setTimeout(() => setMessage(""), 3000);
};


  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setMessage("Благодарим Ви за обратната връзка!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangedPasswordSuccess = () => {
    setMessage("Паролата е променена успешно!");
    setSuccess(true);
    setTimeout(() => setMessage(""), 3000);
  }

  const deleteAccountAndLogout = () => {
    // localStorage.removeItem("userSession");
    // localStorage.removeItem("loginTime");
    dispatch(logout());
    // setIsAuthenticated(false);
    navigate("/login"); 
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <div className="profile-info">
            <div>
              <label>Email</label>
              <div className="info-field">
                {editingField === "email" ? (
                  <>
                    <input
                      input type="email"
                      value={editedUser.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                    />
                    <button onClick={() => saveField("email")} className="edit-icon">✔</button>
                    <button onClick={cancelEdit} className="edit-icon cancel-icon">✖</button>
                  </>
                ) : (
                  <>
                    {editedUser.email}
                    <FaEdit className="edit-icon" onClick={() => setEditingField("email")} />
                  </>
                )}
              </div>
            </div>

            <div>
              <label>Име</label>
              <div className="info-field">
                {editingField === "name" ? (
                  <>
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                    />
                    <button onClick={() => saveField("name")} className="edit-icon">✔</button>
                    <button onClick={cancelEdit} className="edit-icon cancel-icon">✖</button>
                  </>
                ) : (
                  <>
                    {editedUser.name}
                    <FaEdit className="edit-icon" onClick={() => setEditingField("name")} />
                  </>
                )}
              </div>
            </div>

            <div>
              <label>Телефон</label>
              <div className="info-field">
                {editingField === "phoneNumber" ? (
                  <>
                    <input
                      type="text"
                      value={editedUser.phoneNumber}
                      onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                    />
                    <button onClick={() => saveField("phoneNumber")} className="edit-icon">✔</button>
                    <button onClick={cancelEdit} className="edit-icon cancel-icon">✖</button>
                  </>
                ) : (
                  <>
                    {editedUser.phoneNumber || "Без телефон"}
                    <FaEdit className="edit-icon" onClick={() => setEditingField("phoneNumber")} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={success ? "success-message" : "error-message"}>
            {message}
          </div>
        )}

        <div className="profile-buttons">
          <div className="buttons-row">
            {user.hasPassword && (
              <button onClick={() => setIsChangePasswordOpen(true)} className="change-password">
                Смени парола
              </button>
            )}
            <button onClick={() => setIsFeedbackOpen(true)} className="feedback">
              Изпрати обратна връзка
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="delete-account">
              <FaTrash style={{ marginRight: "8px" }} />
              Изтрий акаунт
            </button>
          </div>
        </div>
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          setIsModalOpenSuccess={handleCloseFeedback}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          email={editedUser.email}
          setChangedPasswordSuccess={handleChangedPasswordSuccess}
        />

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => deleteAccountAndLogout()}
          user={editedUser}
        />
      </div>
    </div>
  );
};

export default Profile;
