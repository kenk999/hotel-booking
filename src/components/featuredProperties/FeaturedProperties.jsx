import "./featuredProperties.css"
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SearchContext } from "../../context/SearchContext.jsx";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/hotels?featured=true&limit=4");
  const navigate = useNavigate();
  const { date } = useContext(SearchContext);
  
  // Calculate number of nights from search context
  const calculateNights = (dates) => {
    if (!dates || dates.length === 0 || !dates[0] || !dates[0].startDate || !dates[0].endDate) {
      return 1; // Default to 1 night if no dates provided
    }
    
    const startDate = new Date(dates[0].startDate);
    const endDate = new Date(dates[0].endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    return nights > 0 ? nights : 1;
  };
  
  const nights = calculateNights(date);

  const handlePropertyClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  return (
    <div className="fp">
      {loading ? (
        "Loading"
      ) : (
        <>
          {data?.map((item) => (
            <div 
              className="fpItem" 
              key={item?._id || Math.random()}
              onClick={() => handlePropertyClick(item?._id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={item?.photos?.[0] || "/placeholder.jpg"}
                alt=""
                className="fpImg"
              />
              <span className="fpName">{item?.name || "Hotel Name"}</span>
              <span className="fpCity">{item?.city || "City"}</span>
              <span className="fpPrice">
                {nights > 1 ? (
                  `₹${((item?.cheapestPrice || 0) * nights).toLocaleString()} total`
                ) : (
                  `Starting from ₹${item?.cheapestPrice || "0"}`
                )}
              </span>
              {nights > 1 && (
                <span className="fpPriceDetails">
                  ₹{item?.cheapestPrice || "0"}/night × {nights} nights
                </span>
              )}
              {item?.rating && <div className="fpRating">
                <button>{item.rating}</button>
                <span>Excellent</span>
              </div>}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default FeaturedProperties;

