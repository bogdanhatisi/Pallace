import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { logoutUser } from "../services/userService";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/dashboard/homeUserData",
        {
          credentials: "include", // Include cookies in the request
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      } else {
        console.error("Failed to fetch user data");
        navigate("/login", {
          state: { message: "Please authenticate to continue" },
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login", {
        state: { message: "Please authenticate to continue" },
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
