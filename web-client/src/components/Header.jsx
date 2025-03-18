import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Notifications from '../pages/Notifications';
import '../style/HeaderStyle.css';

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/';
  const isForgotPasswordPage = location.pathname === '/forgot-password';

  return (
    <header className="header">
      <nav className={isForgotPasswordPage ? 'nav' : 'hidden'}>
        <Link to="/Home" className="nav-link">
          Вход
        </Link>
      </nav>

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
              <Link to="/help" className="menu-item" onClick={() => setMenuOpen(false)}>Помощ</Link>
            </div>
          )}
        </div>
      )}

      {isAuthPage && !isForgotPasswordPage && (
        <h1 className={isAuthPage ? 'title-center' : 'title'}>Български Турист</h1>
      )}

      {!isAuthPage && (
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
      )}
    </header>
  );
};

export default Header;
