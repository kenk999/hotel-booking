import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, if available
  const from = location.state?.from || "/";
  const hotelId = location.state?.hotelId;

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login", credentials);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      
      // Navigate back to the hotel page if coming from there, otherwise to home
      if (hotelId) {
        navigate(`/hotels/${hotelId}`);
      } else {
        navigate(from);
      }
    } catch (err) {
      dispatch({ 
        type: "LOGIN_FAILURE", 
        payload: err.response?.data || { message: "Login failed. Please check your credentials." } 
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.username || !credentials.password || !credentials.email) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }
    
    if (credentials.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType("error");
      return;
    }
    
    try {
      setMessage("");
      const res = await axios.post("/auth/register", credentials);
      setMessage("Registration successful! You can now login.");
      setMessageType("success");
      setIsLogin(true); // Switch to login form after successful registration
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="login">
      <div className="lContainer">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        
        {messageType === "success" && <div className="successMessage">{message}</div>}
        {messageType === "error" && <div className="errorMessage">{message}</div>}
        
        {location.state?.message && (
          <div className="loginMessage">{location.state.message}</div>
        )}
        
        <input
          type="text"
          placeholder="username"
          id="username"
          value={credentials.username}
          onChange={handleChange}
          className="lInput"
        />
        
        {!isLogin && (
          <input
            type="email"
            placeholder="email"
            id="email"
            value={credentials.email}
            onChange={handleChange}
            className="lInput"
          />
        )}
        
        <input
          type="password"
          placeholder="password"
          id="password"
          value={credentials.password}
          onChange={handleChange}
          className="lInput"
        />
        
        {isLogin ? (
          <button 
            disabled={loading} 
            onClick={handleLogin} 
            className="lButton"
          >
            Login
          </button>
        ) : (
          <button 
            onClick={handleRegister} 
            className="lButton registerBtn"
          >
            Register
          </button>
        )}
        
        <div className="switchFormContainer">
          {isLogin ? (
            <p>
              Don't have an account? 
              <span className="switchForm" onClick={() => setIsLogin(false)}>
                Register here
              </span>
            </p>
          ) : (
            <p>
              Already have an account? 
              <span className="switchForm" onClick={() => setIsLogin(true)}>
                Login here
              </span>
            </p>
          )}
        </div>
        
        {error && isLogin && <span className="lError">{error.message}</span>}
      </div>
    </div>
  );
};

export default Login;