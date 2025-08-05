import React from 'react';
import { useNavigate } from 'react-router-dom';
import './comingSoon.css';

const ComingSoon = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="comingSoon">
      <div className="comingSoonContainer">
        <div className="comingSoonContent">
          <div className="comingSoonIcon">🚧</div>
          <h1 className="comingSoonTitle">Coming Soon!</h1>
          <p className="comingSoonMessage">
            This feature is under development. Stay tuned!
          </p>
          <p className="comingSoonSubMessage">
            I am working hard to bring you amazing new features. 
            In the meantime, explore my hotel services.
          </p>
          <button 
            className="backToHomeButton" 
            onClick={handleBackToHome}
          >
            Back to Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
