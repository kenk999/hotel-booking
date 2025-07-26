import React, { useEffect, useState } from "react";
import "./home.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Featured from "../../components/featured/Features";
import PropertyList from "../../components/propertyList/PropertyList";
import FeaturedProperties from "../../components/featuredProperties/FeaturedProperties";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  
  useEffect(() => {
    // Check if redirected from successful reservation
    if (location.state?.reserved) {
      setShowConfirmation(true);
      setReservationDetails({
        hotelId: location.state.hotelId,
        rooms: location.state.rooms || [],
        dates: location.state.dates || {}
      });
      
      // Hide confirmation after 5 seconds
      const timer = setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  return (
    <div>
      <Navbar />
      <Header/>
      
      {showConfirmation && (
        <div className="reservationConfirmation">
          <div className="confirmationContent">
            <h3>Reservation Confirmed!</h3>
            {reservationDetails?.rooms?.length > 0 && (
              <p>Room(s): {reservationDetails.rooms.join(", ")}</p>
            )}
            {reservationDetails?.dates?.startDate && (
              <p>Dates: {reservationDetails.dates.startDate} to {reservationDetails.dates.endDate}</p>
            )}
            <p>Thank you for your booking!</p>
          </div>
        </div>
      )}
      
      <div className="homeContainer">
        <Featured/>
        <h1 className="homeTitle">Browse by property type</h1>
        <PropertyList/>
        <h1 className="homeTitle">Homes guests love</h1>
        <FeaturedProperties/>
        <MailList/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;