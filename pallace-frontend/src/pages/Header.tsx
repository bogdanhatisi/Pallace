import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { logoutUser } from "../services/userService";

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  return (
    <header className="header">
      <div className="logo-container" onClick={handleLogoClick}>
        <img src="/logo.png" alt="Pallace Logo" className="header-logo" />
        <span className="logo-text">Pallace</span>
      </div>
      <nav className="header-nav">
        <NavLink to="/home" className="header-nav-item" end>
          Overview
        </NavLink>
        <NavLink to="/transaction" className="header-nav-item">
          Transaction
        </NavLink>
        <NavLink to="/invoice" className="header-nav-item">
          Invoice
        </NavLink>
        <NavLink to="/activity" className="header-nav-item">
          Activity
        </NavLink>
      </nav>
      <div className="header-icons">
        <span className="user-name">{userName}</span>
        <img src="/user-icon.svg" alt="User Profile" className="icon" />
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
