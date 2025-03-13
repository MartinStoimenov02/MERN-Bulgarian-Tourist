import "./style/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import MyPlaces from "./pages/MyPlaces";
import NationalSites from "./pages/NationalSites";
import Nearby from "./pages/Nearby";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    const loginTime = localStorage.getItem("loginTime");
    const sessionExpirationTime = 30 * 60 * 1000;  // 30 минути в милисекунди

    if (session && loginTime) {
      const currentTime = new Date().getTime();
      if (currentTime - loginTime > sessionExpirationTime) {
        localStorage.removeItem("userSession");
        localStorage.removeItem("loginTime");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
    document.title = "Bulgarian Tourist!";
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/home" element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/my-places" element={isAuthenticated ? <MyPlaces setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/my-places/:id" element={isAuthenticated ? <MyPlaces setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/national-sites" element={isAuthenticated ? <NationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/national-sites/:id" element={isAuthenticated ? <NationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/nearby-places" element={isAuthenticated ? <Nearby setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/feedback" element={isAuthenticated ? <Feedback setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/help" element={isAuthenticated ? <Help setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={isAuthenticated ? <Notifications setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
