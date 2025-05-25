import React, { useState, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, HelpCircle } from 'lucide-react';
import { FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import Notifications from '../pages/Notifications';
import Help from '../components/Help';
import '../style/HeaderStyle.css';

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/';
  const isForgotPasswordPage = location.pathname === '/forgot-password';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthPage) {
      const userSession = localStorage.getItem("userSession");
      if (userSession) {
        try {
          setUser(JSON.parse(userSession));
        } catch (err) {
          console.error("Грешка при парсване на userSession:", err);
        }
      }
    }
  }, [isAuthPage]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user) return;
      try {
        const host = process.env.REACT_APP_HOST;
        const port = process.env.REACT_APP_PORT;
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const res = await fetch(`${backendUrl}/notifications/getNotificationsForUser?userId=${user.id}`);
        const data = await res.json();
        const unread = data.data.some(notification => !notification.isRead);
        setHasUnreadNotifications(unread);
      } catch (err) {
        console.error("Грешка при взимане на нотификациите:", err);
      }
    };

    fetchUnreadNotifications();
  }, [user]);

  return (
    <header className="header">
      {isAuthPage && (
        <div className='header-notAuth'>
          <div className="header-title" onClick={() => navigate("/")}>
            Български турист
          </div>
          <div className="auth-buttons">
            <nav>
              <Link to="/login" className="nav-link small-auth-button">
                <FaSignInAlt style={{ marginRight: "8px" }} />
                Вход
              </Link>
            </nav>

            <nav>
              <Link to="/signup" className="nav-link small-auth-button">
                Регистрация
              </Link>
            </nav>
          </div>
        </div>
      )}

      {!isAuthPage && (
        <div className="menu-container">
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
            <Menu size={30} color="#fff" />
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              {user.isAdmin ? (
                <>
                  <Link to="/admin/national-sites" className="menu-item" onClick={() => setMenuOpen(false)}>Туристически обекти</Link>
                  <Link to="/admin/users" className="menu-item" onClick={() => setMenuOpen(false)}>Потребители</Link>
                  <Link to="/admin/logs" className="menu-item" onClick={() => setMenuOpen(false)}>Логове</Link>
                  <Link to="/admin/feedback" className="menu-item" onClick={() => setMenuOpen(false)}>Обратни връзки</Link>
                  <Link to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>Профил</Link>
                </>
              ) : (
                <>
                  <Link to="/home" className="menu-item" onClick={() => setMenuOpen(false)}>Начало</Link>
                  <Link to="/my-places" className="menu-item" onClick={() => setMenuOpen(false)}>Моите места</Link>
                  <Link to="/national-sites" className="menu-item" onClick={() => setMenuOpen(false)}>Национални обекти</Link>
                  <Link to="/nearby-places" className="menu-item" onClick={() => setMenuOpen(false)}>Места в близост</Link>
                  <Link to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>Профил</Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!isAuthPage && (
        <div className="header-right">
          <div className="help">
            <button onClick={() => setHelpOpen(!helpOpen)} className="help-icon">
            <HelpCircle size={30} color="#fff" />
            </button>
              {helpOpen && (
                <div className="help-modal-overlay" onClick={() => setHelpOpen(false)}>
                  <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Помощ и Често Задавани Въпроси</h2>
                    <button className="close-button" onClick={() => setHelpOpen(false)}>✕</button>
                  </div>
                  <Help />
                  </div>
                </div>
              )}
          </div>

          <div className="notification">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="notification-icon">
                <Bell size={30} color="#fff" />
                {hasUnreadNotifications && <span className="notification-dot" />}
              </button>

              {/* Падащо меню за десктоп */}
              {!isMobile && notificationsOpen && (
                <div className="notifications-dropdown">
                  <Notifications setHasUnreadNotifications={setHasUnreadNotifications}/>
                </div>
              )}

              {/* Модален прозорец за мобилни */}
              {isMobile && notificationsOpen && (
                <div className="help-modal-overlay" onClick={() => setNotificationsOpen(false)}>
                  <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Уведомления</h2>
                      <button className="close-button" onClick={() => setNotificationsOpen(false)}>✕</button>
                    </div>
                    <Notifications setHasUnreadNotifications={setHasUnreadNotifications}/>
                  </div>
                </div>
              )}
            </div>

          <div className="logout-button">
            <button onClick={() => {
              localStorage.removeItem("userSession");
              localStorage.removeItem("loginTime");
              window.location.href = "/login";
            }} className="small-logout-button">
              <FaSignOutAlt style={{ marginRight: "8px" }} />
              Изход
            </button>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
