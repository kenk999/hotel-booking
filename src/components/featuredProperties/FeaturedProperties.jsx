import "./featuredProperties.css"
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/hotels?featured=true&limit=4");
  const navigate = useNavigate();

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
              <span className="fpPrice">Starting from ${item?.cheapestPrice || "0"}</span>
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

