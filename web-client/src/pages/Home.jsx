import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user session from localStorage
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      const user = JSON.parse(userSession);
      setUserName(user.name); // Set the user's name
    }
  }, []);

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem("userSession");
    localStorage.removeItem("loginTime");
    setIsAuthenticated(false); // Update session state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Добре дошли, {userName ? userName : "гост"}!</h1>
      <p>Вие успешно влязохте в системата.</p>
      <button onClick={handleLogout}>LogOut</button>
    </div>
  );
}

export default Home;
