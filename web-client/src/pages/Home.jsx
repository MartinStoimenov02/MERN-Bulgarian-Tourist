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
      console.log("user: ", user);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem("userSession");
    localStorage.removeItem("loginTime");
    setIsAuthenticated(false);
    navigate("/login"); 
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
