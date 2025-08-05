import "./hotel.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer.jsx";
import useFetch from "../../hooks/useFetch.js";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext.jsx";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Reserve from "../../components/reserve/Reserve";

// Default hotel images if none are available from the API
const defaultImages = [
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090917.jpg?k=d17621b71b0eaa0c7a37d8d8d02d33896cef75145a71d5e8e627f9dc0b4c2f0f&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090370.jpg?k=c5d8e3c7b39f1a0b2d170a818b713147aa2e5f2002c6dff77ca5adf7d72c82d8&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090372.jpg?k=3a6b6fcd2906ecbf7bf13c9f9c507204326a9f30b8f3cb3d334f390e5e25cd59&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090374.jpg?k=f9e0ca2a4f5c304f7fb87d8f7ddd5e5d7b02489e3f8f258634828c2c5ad0d9bf&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090376.jpg?k=c9b9d1f3e8e652f3a3cc5b142eda1e3e74a2a676e7d22ca5c0d3c2458c378a52&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/295090378.jpg?k=4d24271710a8c1a246e20798a83da6eec2ac6e2ef60fabd8db2d3081e0e3aa3f&o=&hp=1"
];

const Hotel = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [hotelImages, setHotelImages] = useState([]);

  const { data, loading, error } = useFetch(`/hotels/find/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { date = [], options = {}, city, dispatch } = useContext(SearchContext) || {};

  // Helper function to get default dates
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return [{
      startDate: today,
      endDate: tomorrow,
      key: "selection"
    }];
  };

  // Get search parameters from navigation state or context
  const passedSearchParams = location.state?.searchParams;
  
  // Use passed parameters first, then context, then defaults
  const dates = passedSearchParams?.dates || 
                (date && date.length > 0 ? date : getDefaultDates());
  
  const searchOptions = passedSearchParams?.options || 
                       (options.adult ? options : { adult: 1, children: 0, room: 1 });
  
  // Update context with the current search parameters to maintain consistency
  useEffect(() => {
    if (passedSearchParams) {
      dispatch({
        type: "NEW_SEARCH",
        payload: {
          city: city,
          date: passedSearchParams.dates,
          options: passedSearchParams.options
        }
      });
    }
  }, [passedSearchParams, city, dispatch]);
  
  // Ensure we have proper search parameters to maintain state
  const searchParams = {
    destination: city,
    date: dates,
    options: searchOptions
  };

  // Process and prepare hotel images
  useEffect(() => {
    if (data && data.photos && data.photos.length > 0) {
      // Check if photos are full URLs or just filenames
      const processedImages = data.photos.map(photo => {
        if (photo.startsWith('http')) {
          return photo;
        } else {
          // For development, use default images if photos are just filenames
          // In production, you would construct proper URLs to your image server
          return `/images/${photo}`;
        }
      });
      
      setHotelImages(processedImages);
    } else {
      // Use default images if no photos available
      setHotelImages(defaultImages);
    }
  }, [data]);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    if (!date1 || !date2) return 1; // Default to 1 day if dates are missing
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays || 1; // Ensure at least 1 day
  }

  const days = dayDifference(dates[0]?.endDate, dates[0]?.startDate) || 1;

  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction, e) => {
    // Prevent default browser behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!hotelImages.length) return;
    
    let newSlideNumber;
    const maxIndex = hotelImages.length - 1;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? maxIndex : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === maxIndex ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
  };

  const handleClick = () => {
    if (user) {
      setOpenModal(true);
    } else {
      navigate("/login", { state: { 
        from: location.pathname,
        hotelId: id,
        message: "Please login to reserve a room" 
      }});
    }
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      {loading ? (
        <div className="loadingContainer">Loading hotel details...</div>
      ) : error ? (
        <div className="errorContainer">Error loading hotel details. Please try again.</div>
      ) : (
        <div className="hotelContainer">
          {open && (
            <div className="slider">
              <FontAwesomeIcon
                icon={faCircleXmark}
                className="close"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
              />
              <FontAwesomeIcon
                icon={faCircleArrowLeft}
                className="arrow"
                onClick={(e) => handleMove("l", e)}
                onMouseDown={(e) => e.preventDefault()}
              />
              <div className="sliderWrapper">
                <img
                  src={hotelImages[slideNumber] || defaultImages[0]}
                  alt={`${data?.name || 'Hotel'} view ${slideNumber + 1}`}
                  className="sliderImg"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
              <FontAwesomeIcon
                icon={faCircleArrowRight}
                className="arrow"
                onClick={(e) => handleMove("r", e)}
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
          )}
          <div className="hotelWrapper">
            <div className="hotelNavigation">
              <button 
                className="backToList" 
                onClick={() => navigate('/hotels', { 
                  state: {
                    destination: searchParams.destination,
                    date: searchParams.date,
                    options: searchParams.options
                  }
                })}
              >
                ← Back to search results
              </button>
            </div>
            <button className="bookNow" onClick={handleClick}>Reserve or Book Now!</button>
            <h1 className="hotelTitle">{data?.name || "Hotel Name"}</h1>
            <div className="hotelAddress">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data?.address || "Address"}</span>
            </div>
            <span className="hotelDistance">
              Excellent location – {data?.distance || "0"}m from center
            </span>
            <span className="hotelPriceHighlight">
              Book a stay over ₹{data?.cheapestPrice || "0"} at this property and get a
              free airport taxi
            </span>
            <div className="hotelImages">
              {hotelImages.map((photo, i) => (
                <div className="hotelImgWrapper" key={i}>
                  <img
                    onClick={() => handleOpen(i)}
                    src={photo || defaultImages[0]}
                    alt={`${data?.name || 'Hotel'} view ${i + 1}`}
                    className="hotelImg"
                  />
                </div>
              ))}
            </div>
            <div className="hotelDetails">
              <div className="hotelDetailsTexts">
                <h1 className="hotelTitle">{data?.title || "Hotel Title"}</h1>
                <p className="hotelDesc">{data?.desc || "Hotel Description"}</p>
              </div>
              <div className="hotelDetailsPrice">
                <h1>Perfect for a {days}-night stay!</h1>
                <span>
                  Located in the real heart of Krakow, this property has an
                  excellent location score of 9.8!
                </span>
                <h2>
                  <b>₹{(days * (data?.cheapestPrice || 0) * (searchOptions?.room || 1)).toLocaleString()}</b> ({days}{" "}
                  nights)
                </h2>
                <button onClick={handleClick}>Reserve or Book Now!</button>
              </div>
            </div>
          </div>
          <MailList />
          <Footer />
        </div>
      )}
      {openModal && <Reserve setOpen={setOpenModal} hotelId={id}/>}
    </div>
  );
};

export default Hotel;