import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../style/LoginStyle.css";
import shipkaImage from "../images/shipka.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/userSlice';

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(shipkaImage);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = "tourist sites in Bulgaria";
        const res = await Axios.get(
          `${backendUrl}/google/random-image?query=${encodeURIComponent(query)}`
        );
        setImageUrl(res.data.imageUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Axios.post(`${backendUrl}/users/getUser`, formData);
      if (res.data.success) {
        // localStorage.setItem("userSession", JSON.stringify(res.data.user));
        // localStorage.setItem("loginTime", new Date().getTime());
        // setIsAuthenticated(true);
        dispatch(loginSuccess(res.data.user));
        if(res.data.user.isAdmin){
          navigate("/admin/national-sites");
        } else{
          navigate("/home");
        }
      } else {
        setMessage(res.data.message);
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("login error: ", error);
      setMessage(error.response?.data?.message || "Грешка при вход");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    const decoded = jwtDecode(response.credential);
    try {
      const userData = { 
        email: decoded.email, 
        name: decoded.name
    };
    
    if (decoded.phone_number) { 
        userData.phoneNumber = decoded.phone_number; 
    }

      const res = await Axios.post(`${backendUrl}/users/googleAuth`, { userData });
      // localStorage.setItem("userSession", JSON.stringify(res.data.user));
      // localStorage.setItem("loginTime", new Date().getTime());
      // setIsAuthenticated(true);
      dispatch(loginSuccess(res.data.user)); 
      if(res.data.user.isAdmin){
        navigate("/admin/national-sites");
      } else{
        navigate("/home");
      }
    } catch (error) {
      console.error("error google login: ",error);
      setMessage("Грешка при Google вход");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const userCheck = await Axios.post(`${backendUrl}/users/checkUserExists`, {
        email: formData.email
      });
      
      if (!userCheck.data.exists) {
        setMessage("Имейлът не е намерен в системата");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      
      await Axios.post(`${backendUrl}/email/sendVerificationCode`, {
        email: formData.email
      });
      setShowModal(true);
      setSuccess(true);
      setMessage("Имейл с код за верификация е изпратен.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("error sending code: ", error);
      setMessage(error.response?.data?.message || "Грешка при изпращане на кода");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await Axios.post(`${backendUrl}/email/verifyCode`, {
        email: formData.email,
        code: verificationCode,
      });
  
      if (res.data.success) {
        navigate("/forgot-password", { state: { email: formData.email, allowed: true } });
      } else {
        setMessage("Невалиден код");
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("error verifying code: ", error);
      setMessage("Грешка при проверката на кода");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <GoogleOAuthProvider clientId="393053260698-rd9q75m5nlfrqg0h6t3j3v1662lh27m7.apps.googleusercontent.com">
    <div className="container-login">
      <table width="80%" border="1">
        <tbody>
          <tr>
            <td width="60%">
              <div className="image-container-login">
                {loading ? (
                  <p>Loading image...</p>
                ) : (
                  <img src={imageUrl} alt="Login" className="login-image loaded" />
                )}
              </div>
            </td>
            <td className="form-container-login">
              <h2>Вход</h2>
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Имейл" onChange={handleChange} required />
                <div className="password-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Парола" 
                    onChange={handleChange} 
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
                <button type="submit" className="btn-login">Вход</button>
                <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setMessage("Грешка при Google вход")} />
              </form>
              {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
              <p>Нямате акаунт? <Link to="/signup">Регистрация</Link></p>
              <button onClick={handleForgotPassword} className="forgot-password">
                Забравена парола?
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Въведете код за верификация</h3>
            <input 
              type="text" 
              placeholder="Въведете код" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              required
            />
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleVerifyCode}>Потвърди</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Затвори</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
