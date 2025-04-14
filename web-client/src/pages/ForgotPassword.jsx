import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import "../style/LoginStyle.css"; // Using the same style for consistency
import shipkaImage from "../images/shipka.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const isAllowed = location.state?.allowed;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(shipkaImage);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  // Redirect if accessed directly
  useEffect(() => {
    if (!isAllowed) {
      navigate("/login");
    }
  }, [isAllowed, navigate]);

  // Fetch background image
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = "tourist sites in Bulgaria";
        const res = await Axios.get(
          `http://`+host+`:`+port+`/google/random-image?query=${encodeURIComponent(query)}`
        );
        setImageUrl(res.data.imageUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [host, port]);

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/.test(password);
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage("Паролите не съвпадат!");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!validatePassword(password)) {
      setMessage("Паролата трябва да съдържа поне 8 символа, главна буква, малка буква и цифра.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await Axios.post("http://"+host+":"+port+"/users/resetPassword", {
        email,
        password,
      });

      if (res.data.success) {
        setMessage("Паролата е променена успешно! Пренасочване към вход...");
        setSuccess(true);
        setTimeout(() => navigate("/login"));
      } else {
        setMessage("Грешка при промяна на паролата.");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("error changing password: ", error);
      setMessage("Грешка при промяната на паролата.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (!isAllowed) return null;

  return (
    <div className="container-login">
      <table width="80%" border="1">
        <tbody>
          <tr>
            <td width="60%">
              <div className="image-container-login">
                {loading ? (
                  <p>Loading image...</p>
                ) : (
                  <img src={imageUrl} alt="Forgot Password" className="login-image loaded" />
                )}
              </div>
            </td>
            <td className="form-container-login">
              <h2>Възстановяване на парола</h2>
              <p className="email-info">Промяна на паролата за: <strong>{email}</strong></p>
              {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}

              <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                <div className="password-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Нова парола" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="password-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Потвърдете паролата" 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button type="submit" className="btn-login">Смени паролата</button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ForgotPassword;
