import "./style/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
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
import GuestPage from "./pages/GuestPage";
import AdminNationalSites from "./pages/AdminNationalSites";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import AdminFeedback from "./pages/AdminFeedback";
import { logout } from './redux/userSlice';
import 'leaflet/dist/leaflet.css';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) return;

    const sessionExpirationTime = 30 * 60 * 1000; // 30 минути

    const timeoutId = setTimeout(() => {
      dispatch(logout());
      alert("Сесията е изтекла. Моля, влезте отново.");
    }, sessionExpirationTime);

    // Изчисти таймера при logout или unmount
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, dispatch]);

  // useEffect(() => {
  //   const session = localStorage.getItem("userSession");
  //   const loginTime = localStorage.getItem("loginTime");
  //   const sessionExpirationTime = 30 * 60 * 1000;  // 30 минути в милисекунди

  //   if (session && loginTime) {
  //     const currentTime = new Date().getTime();
  //     if (currentTime - loginTime > sessionExpirationTime) {
  //       localStorage.removeItem("userSession");
  //       localStorage.removeItem("loginTime");
  //       setIsAuthenticated(false);
  //     } else {
  //       setIsAuthenticated(true);
  //     }
  //   } else {
  //     setIsAuthenticated(false);
  //   }
  //   document.title = "Bulgarian Tourist!";
  // }, []);

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/my-places" element={isAuthenticated ? <MyPlaces /> : <Navigate to="/" />} />
            <Route path="/my-places/:id" element={isAuthenticated ? <MyPlaces /> : <Navigate to="/" />} />
            <Route path="/national-sites" element={isAuthenticated ? <NationalSites /> : <Navigate to="/" />} />
            <Route path="/national-sites/:id" element={isAuthenticated ? <NationalSites /> : <Navigate to="/" />} />
            <Route path="/nearby-places" element={isAuthenticated ? <Nearby /> : <Navigate to="/" />} />
            <Route path="/nearby-places/:id" element={isAuthenticated ? <Nearby /> : <Navigate to="/" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" />} />
            <Route path="/admin/national-sites" element={isAuthenticated ? <AdminNationalSites /> : <Navigate to="/" />} />
            <Route path="/admin/national-sites/:id" element={isAuthenticated ? <AdminNationalSites /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={isAuthenticated ? <AdminUsers /> : <Navigate to="/" />} />
            <Route path="/admin/logs" element={isAuthenticated ? <AdminLogs /> : <Navigate to="/" />} />
            <Route path="/admin/feedback" element={isAuthenticated ? <AdminFeedback /> : <Navigate to="/" />} />
            {/* <Route path="/home" element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/my-places" element={isAuthenticated ? <MyPlaces setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/my-places/:id" element={isAuthenticated ? <MyPlaces setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/national-sites" element={isAuthenticated ? <NationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/national-sites/:id" element={isAuthenticated ? <NationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/nearby-places" element={isAuthenticated ? <Nearby setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/nearby-places/:id" element={isAuthenticated ? <Nearby setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/admin/national-sites" element={isAuthenticated ? <AdminNationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/admin/national-sites/:id" element={isAuthenticated ? <AdminNationalSites setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={isAuthenticated ? <AdminUsers setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/admin/logs" element={isAuthenticated ? <AdminLogs setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/admin/feedback" element={isAuthenticated ? <AdminFeedback setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} /> */}
            <Route path="/" element={<GuestPage/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
