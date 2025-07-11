import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../style/SignUpStyle.css";
import { Link } from "react-router-dom";
import shipkaImage from "../images/shipka.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/userSlice';

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [imageUrl, setImageUrl] = useState(shipkaImage); 
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await Axios.get("https://api.unsplash.com/search/photos", {
          params: {
            query: "Bulgaria",
            client_id: "qHq1ytJzFs1mGrKLVagNoPSxc__JtazBpxlKfjnALKE"
          }
        });
        const images = res.data.results;
        if (images.length > 0) {
          const randomIndex = Math.floor(Math.random() * images.length);
          const randomImage = images[randomIndex];

          const imageUrl = randomImage.urls.regular;
        setImageUrl(imageUrl);
        }
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;
    const phoneRegex = /^[0-9+/]+$/;

    if (!passwordRegex.test(formData.password)) {
      setMessage("Паролата трябва да е поне 8 символа и да съдържа главна, малка буква и цифра.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Паролите не съвпадат.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const digitCount = formData.phoneNumber.replace(/\D/g, "").length;
    if (!phoneRegex.test(formData.phoneNumber) || digitCount < 10) {
      setMessage("Телефонният номер трябва да съдържа поне 10 цифри и може да има + и /.");
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const validationRes = await Axios.post(`${backendUrl}/users/validateUser`, formData);
      if (!validationRes.data.success) {
        setMessage(validationRes.data.message);
        setSuccess(false);
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      await Axios.post(`${backendUrl}/email/sendVerificationCode`, { email: formData.email });
      setSuccess(true);
      setMessage("Имейл с код за верификация е изпратен.");
      setTimeout(() => setMessage(""), 3000);
      setShowModal(true);
    } catch (error) {
      console.error("error sending verification code: ", error);
      setMessage(error.response.data.message);
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
      dispatch(loginSuccess(res.data.user));
      // setIsAuthenticated(true);
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

  const handleModalSubmit = async () => {
    try {
      const res = await Axios.post(`${backendUrl}/email/verifyCode`, {
        email: formData.email,
        code: verificationCode,
      });

      if (res.data.success) {
        await Axios.post(`${backendUrl}/users/createUser`, formData);
        setMessage("Регистрацията е успешна!");
        setSuccess(true);
      
        const getUser = await Axios.post(`${backendUrl}/users/getUser`, formData);
        if (getUser.data.success) {
          const user = getUser.data.user;
          // localStorage.setItem("userSession", JSON.stringify(user));
          // localStorage.setItem("loginTime", new Date().getTime());
          dispatch(loginSuccess(user));
          // setIsAuthenticated(true);
          if (user.isAdmin) { 
            navigate("/admin/national-sites");
          } else {
            navigate("/home");
          }
        } else {
          setMessage(getUser.data.message);
          setSuccess(false);
          setTimeout(() => setMessage(""), 3000);
        }
      } else {
        setSuccess(false);
        setMessage("Невалиден код.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("error verifying code/creating user: ", error);
      setSuccess(false);
      setMessage(error.response.data.message);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <GoogleOAuthProvider clientId="1035977394524-nlql4nv7m8nhh9h1jlts20nc807fjr12.apps.googleusercontent.com">
    <div className="signup-page container-signup">
      <table width="80%" border="1">
        <tbody>
          <tr>
            <td width="60%">
              <div className="image-container-signup">
                {loading ? (
                  <p>Loading image...</p>
                ) : (
                  <img src={imageUrl} alt="Sign Up" className="signup-image" />
                )}
              </div>
            </td>
            <td className="form-container-signup">
              <h2>Регистрация</h2>
              {message && <p className={success ? "success-message" : "error-message"}>{message}</p>}
              <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Име" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Имейл" onChange={handleChange} required />
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Парола"
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Повтори паролата"
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <input type="text" name="phoneNumber" placeholder="Телефонен номер" onChange={handleChange} required />
                <button type="submit" className="btn-signup">Регистрирай се</button>
                <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setMessage("Грешка при Google вход")} />
              </form>
              <p>Вече имате акаунт? <Link to="/login">Вход</Link></p>
            </td>
          </tr>
        </tbody>
      </table>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Въведете код за верификация</h3>
            <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Въведете код" required />
            <div className="modal-buttons">
            <button className="btn-primary" onClick={handleModalSubmit}>Потвърди</button>
            <button className="btn-cancel" onClick={() => setShowModal(false)}>Затвори</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </GoogleOAuthProvider>
  );
}

export default SignUp;
