import "./searchItem.css";
import { Link } from "react-router-dom";

const SearchItem = ({ item, dates, options, index = 0 }) => {
  // Calculate number of nights
  const calculateNights = (dates) => {
    if (!dates || !dates[0] || !dates[0].startDate || !dates[0].endDate) {
      return 1; // Default to 1 night if no dates provided
    }
    
    const startDate = new Date(dates[0].startDate);
    const endDate = new Date(dates[0].endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    return nights > 0 ? nights : 1;
  };
  
  const nights = calculateNights(dates);
  const pricePerNight = item?.cheapestPrice || 0;
  const totalPrice = pricePerNight * nights;
  
  // Format dates for display
  const formatDateRange = (dates) => {
    if (!dates || !dates[0] || !dates[0].startDate || !dates[0].endDate) {
      return "";
    }
    
    const startDate = new Date(dates[0].startDate);
    const endDate = new Date(dates[0].endDate);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  const dateRange = formatDateRange(dates);
  return (
    <div className="searchItem" style={{ animationDelay: `${index * 0.1}s` }}>
      <img src={item?.photos?.[0] || "/placeholder.jpg"} alt="" className="siImg" />
      <div className="siDesc">
        <h1 className="siTitle">{item?.name || "Hotel Name"}</h1>
        <span className="siDistance">{item?.distance || "0"}m from center</span>
        <span className="siTaxiOp">Free airport taxi</span>
        <span className="siSubtitle">
          Studio Apartment with Air conditioning
        </span>
        <span className="siFeatures">{item?.desc || "Hotel Description"}</span>
        <span className="siCancelOp">Free cancellation </span>
        <span className="siCancelOpSubtitle">
          You can cancel later, so lock in this great price today!
        </span>
      </div>
      <div className="siDetails">
        {item?.rating && <div className="siRating">
          <span>Excellent</span>
          <button>{item.rating}</button>
        </div>}
        <div className="siDetailTexts">
          <span className="siPrice">₹{totalPrice.toLocaleString()}</span>
          <span className="siPriceDetails">
            ₹{pricePerNight}/night
            {dateRange && <span className="siDateRange"> • {dateRange}</span>}
          </span>
          <span className="siTaxOp">Includes taxes and fees</span>
          <Link 
            to={`/hotels/${item?._id || ""}`}
            state={{
              searchParams: {
                dates: dates,
                options: options
              }
            }}
          >
            <button className="siCheckButton">See availability</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;