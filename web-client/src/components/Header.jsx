import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/';
  const isForgotPasswordPage = location.pathname === '/forgot-password';

  return (
    <header className="header">
      {isAuthPage && (
        <div className='header-notAuth'>
          <div className="header-title">Български турист</div>

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
              <Link to="/home" className="menu-item" onClick={() => setMenuOpen(false)}>Начало</Link>
              <Link to="/my-places" className="menu-item" onClick={() => setMenuOpen(false)}>Моите места</Link>
              <Link to="/national-sites" className="menu-item" onClick={() => setMenuOpen(false)}>Национални обекти</Link>
              <Link to="/nearby-places" className="menu-item" onClick={() => setMenuOpen(false)}>Места в близост</Link>
              <Link to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>Профил</Link>
            </div>
          )}
        </div>
      )}

      {/* {isAuthPage && !isForgotPasswordPage && (
        <h1 className={isAuthPage ? 'title-center' : 'title'}>Български Турист</h1>
      )} */}

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
            </button>
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <Notifications />
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
