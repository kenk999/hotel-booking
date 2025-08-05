import React, { useContext, useState } from "react";
import "./header.css"
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faBed, faPlane, faCar, faTaxi, faPerson, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {format} from "date-fns"
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const Header = function ({type}){
    const [date, setDate]=useState([{
        startDate:new Date(), endDate:new Date(), key : "selection"}
    ])

    const [openDate,setOpenDate]=useState(false)
      function clicker(){setOpenDate(openDate===true?false:true)};

      const [openOptions,setOpenOptions]=useState(false);
      function newClicker(){setOpenOptions(openOptions===true?false:true)}
    
      const { user } = useContext(AuthContext);
      const navigate = useNavigate();

      const [options,setOptions]=useState(
        {adult:1,
            children:0,
            room:1
        }
      )

      const [destination,setDestination]=useState("")
      const [showCityAlert, setShowCityAlert] = useState(false);
      const allowedCities = ["Bengaluru", "Mumbai", "Delhi"];
      
    function handleOption(name,operation){
           setOptions(function(prev)
           {return{
           ...prev, [name]: operation==="i"?prev[name]+1:prev[name]-1
           }
           })

    };
const{dispatch}=useContext(SearchContext)

    const handleSearch=function(){
      // Check if destination is empty or not in allowed cities (case insensitive)
      const normalizedDestination = destination.trim();
      if (normalizedDestination === "") {
        // Allow empty destination (show all)
        dispatch({ type: "NEW_SEARCH", payload: { city: "", date, options } });
        navigate("/hotels", { state: { destination: "", date, options } });
        return;
      }
      
      // Find the matching city with proper capitalization
      const matchedCity = allowedCities.find(city => 
        city.toLowerCase() === normalizedDestination.toLowerCase()
      );
      
      if (matchedCity) {
        // If city is allowed, proceed with search using the properly capitalized city name
        dispatch({ type: "NEW_SEARCH", payload: { city: matchedCity, date, options } });
        navigate("/hotels", { state: { destination: matchedCity, date, options } });
      } else {
        // If city is not allowed, show alert
        setShowCityAlert(true);
        // Remove auto-hide timer
      }
    }
    
   function inputRecorder(event){setDestination(event.target.value)}
   
   const handleAuth = () => {
     navigate("/login");
   }
   
   const handleCloseAlert = () => {
     setShowCityAlert(false);
   }

    return (
    <div className="header" >
      <div className={type==="list"?"headerContainer listMode":"headerContainer"}>
        <div className="headerList">
            <div className="headerListItem active">
                 <FontAwesomeIcon icon={faBed} />
                 <span>Stays</span>
            </div>
  
            <div className="headerListItem" onClick={() => navigate('/flights')}>
                 <FontAwesomeIcon icon={faPlane} />
                 <span>Flights</span>
            </div>
            <div className="headerListItem" onClick={() => navigate('/car-rentals')}>
                 <FontAwesomeIcon icon={faCar} />
                 <span>Car rentals</span>
            </div>
               <div className="headerListItem" onClick={() => navigate('/attractions')}>
                 <FontAwesomeIcon icon={faBed} />
                 <span>Attractions</span>
            </div>
               <div className="headerListItem" onClick={() => navigate('/airport-taxis')}>
                 <FontAwesomeIcon icon={faTaxi} />
                 <span>Airport taxis</span>
            </div>
            
          </div>
         { type !=="list" && <>  <h1 className="headerTitle">A lifetime of discounts? It's Genius!</h1>
         <p className="headerDesc"> Get rewarder for your travels - unlock instant savings of 10% or more with a free Indibooking account</p>
         
         {!user && (
           <button className="headerBtn" onClick={handleAuth}>Sign in / Register</button>
         )}
         
         <div className="headerSearch">
            <div className="headerSearchItem">
                <FontAwesomeIcon icon={faBed} className="headerIcon"/>
                <input 
                  type="text" 
                  onChange={inputRecorder} 
                  placeholder="where are you going?" 
                  className="headerSearchInput"
                  value={destination}
                />
                {showCityAlert && (
                  <div className="cityAlert">
                    <div className="cityAlertContent">
                      <span>We'll be expanding soon! Right now, we serve Bengaluru, Mumbai, and Delhi.</span>
                      <button className="cityAlertClose" onClick={handleCloseAlert}>×</button>
                    </div>
                  </div>
                )}
             </div>
             <div className="headerSearchItem">
                <FontAwesomeIcon icon={faCalendarDays} className="headerIcon"/>
                <span onClick={clicker} className="headerSearchText">{`${format(date[0].startDate,"MM/dd/yyyy")} to ${format(date[0].endDate,"MM/dd/yyyy")}`}</span>
              {openDate  && <DateRange minDate={new Date()}
  editableDateInputs={true}
  onChange={item => setDate([item.selection])}
  moveRangeOnFirstSelection={false}
  ranges={date}
  className="date"
/>}
             </div>

           <div className="headerSearchItem">
  <FontAwesomeIcon icon={faPerson} className="headerIcon" />
  <span className="headerSearchText" onClick={newClicker}>{`${options.adult} adult · ${options.children} children · ${options.room} room`}</span>
  {openOptions && <div className="options">
   
      <div className="optionItem">
        <span className="optionText" >Adult</span>
        <div className="optionCounter">
          <button disabled={options.adult<=1} className="optionCounterButton" onClick={()=>handleOption("adult","d")}>−</button>
          <span className="optionCounterNumber">{options.adult}</span>
          <button className="optionCounterButton" onClick={()=>handleOption("adult","i")}>+</button>
        </div>
      </div>

      <div className="optionItem">
        <span className="optionText">Children</span>
        <div className="optionCounter">
          <button disabled={options.children<1} className="optionCounterButton" onClick={()=>handleOption("children","d")}>−</button>
          <span className="optionCounterNumber">{options.children}</span>
          <button className="optionCounterButton" onClick={()=>handleOption("children","i")}>+</button>
        </div>
      </div>

      <div className="optionItem">
        <span className="optionText">Room</span>
        <div className="optionCounter">
          <button className="optionCounterButton" disabled={options.room<=1} onClick={()=>handleOption("room","d")}>−</button>
          <span className="optionCounterNumber">{options.room}</span>
          <button className="optionCounterButton" onClick={()=>handleOption("room","i")}>+</button>
        </div>
      </div>
    
  </div>}
</div>
            <div className="headerSearchItem spacer"></div>      
            <div className="headerSearchItem searchBtnItem">
                <button className="headerBut" onClick={handleSearch}>Search </button>
            </div>
         </div></>}
        </div>
    </div>)
}

export default Header;