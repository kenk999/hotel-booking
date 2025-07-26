import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

const Navbar = function(){ 
  const { user, dispatch } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    setDropdownOpen(false);
    navigate("/");
  };
  
  const handleLogin = () => {
    navigate("/login");
  };
        
  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="logo">Indibooking</span>
        </Link>
        {user ? (
          <div className="userDropdown" ref={dropdownRef}>
            <div 
              className="username" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.username}
              <span className="dropdownArrow">▼</span>
            </div>
            {dropdownOpen && (
              <div className="dropdownMenu">
                <div className="dropdownItem logoutItem" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="navItems">
            <button className="navButton" onClick={handleLogin}>Login</button>
            <button className="navButton" onClick={handleLogin}>Register</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;