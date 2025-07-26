import "./featured.css"
import mumbaiGif from '../../assets/Mum.jpg';
import delhi from '../../assets/Del.jpg';
import bangalore from '../../assets/bang.jpg';
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
const Featured=function (){
        const navigate=useNavigate();

    // Default dates: today and tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const defaultDates = [
      {
        startDate: today,
        endDate: tomorrow,
        key: "selection"
      }
    ];
    const defaultOptions = {
      adult: 1,
      children: 0,
      room: 1
    };

    const handleSearch = function(){
      navigate("/hotels", {
        state: {
          destination: "Mumbai",
          date: defaultDates,
          options: defaultOptions
        }
      });
    }
    
    const handleSearchOne = function() {
      navigate("/hotels", {
        state: {
          destination: "Delhi",
          date: defaultDates,
          options: defaultOptions
        }
      });
    }
    
    const handleSearchTwo = function() {
      navigate("/hotels", {
        state: {
          destination: "Bengaluru",
          date: defaultDates,
          options: defaultOptions
        }
      });
    }
    

    const {data,loading,error}=useFetch("/hotels/countByCity?cities=Delhi,Bengaluru,Mumbai")
  
    
    
    return (
    <div className="featured">
     {loading?"please wait your data is loading!": <>
        <div className="featuredItem" onClick={handleSearch}>
            <img src={mumbaiGif}  alt ="" className="featuredImg"/>
            <div className="featuredTitles">
                <h1>Mumbai</h1>
                <h2>{data[2]} Properties</h2>
            </div>
         </div>
        <div className="featuredItem"  onClick={handleSearchOne}>
            <img src={delhi}  alt ="" className="featuredImg"/>
            <div className="featuredTitles">
                <h1>Delhi</h1>
                <h2>{data[0]} Properties</h2>
            </div>
         </div>
          <div className="featuredItem" onClick={handleSearchTwo}>
            <img src={bangalore}  alt =""  className="featuredImg"/>
            <div className="featuredTitles">
                <h1>Bengaluru</h1>
                <h2>{data[1]} Properties</h2>
            </div>
         </div></>}


    </div>
)}

export default Featured;