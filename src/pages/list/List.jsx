import "./list.css"
import React, { useState, useEffect, useContext, useMemo } from "react"
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'
import { format } from "date-fns"
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom"
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../context/SearchContext.jsx";

const List = () => {
  const location = useLocation();
  const { date: contextDate, options: contextOptions, city: contextCity, dispatch } = useContext(SearchContext);
  
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
  
  // Prioritize location.state, then context, then defaults
  // Special handling: if location.state has destination explicitly set to "", respect that
  const [destination, setDestination] = useState(() => {
    if (location.state && location.state.hasOwnProperty('destination')) {
      // If location.state explicitly has destination (even if empty), use it
      return location.state.destination;
    }
    // If this is a universal search (like property type browsing), don't use context city
    if (location.state && location.state.isUniversalSearch) {
      return "";
    }
    // Otherwise fall back to context or empty
    return contextCity || "";
  });
  
  const [type, setType] = useState(location.state?.type || "");
  const [date, setDate] = useState(
    location.state?.date || 
    (contextDate && contextDate.length > 0 ? contextDate : getDefaultDates())
  );
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(
    location.state?.options || 
    (contextOptions?.adult ? contextOptions : {
      adult: 1,
      children: 0,
      room: 1
    })
  );
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  
  // Update SearchContext when local state changes
  useEffect(() => {
    dispatch({
      type: "NEW_SEARCH",
      payload: {
        city: destination,
        date: date,
        options: options
      }
    });
  }, [destination, date, options, dispatch]);

  // Calculate number of nights for price filtering - memoized for performance
  const nights = useMemo(() => {
    if (!date || !date[0] || !date[0].startDate || !date[0].endDate) {
      return 1; // Default to 1 night if no dates provided
    }
    
    const startDate = new Date(date[0].startDate);
    const endDate = new Date(date[0].endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const calculatedNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    return calculatedNights > 0 ? calculatedNights : 1;
  }, [date]);

  // Build URL for API call - memoized for performance
  const buildUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (destination && destination.trim() !== '') {
      params.append('city', destination.trim());
    }
    if (type && type.trim() !== '') {
      params.append('type', type.trim());
    }
    // Convert total stay price to per-night price for backend filtering
    if (min && !isNaN(parseFloat(min))) {
      const perNightMin = parseFloat(min) / nights;
      params.append('min', perNightMin.toString());
    }
    if (max && !isNaN(parseFloat(max))) {
      const perNightMax = parseFloat(max) / nights;
      params.append('max', perNightMax.toString());
    }
    
    // Add guest information for capacity filtering
    if (options.adult) params.append('adult', options.adult);
    if (options.children) params.append('children', options.children);
    
    // Add date range for availability checking
    if (date[0]?.startDate) params.append('startDate', date[0].startDate.toISOString());
    if (date[0]?.endDate) params.append('endDate', date[0].endDate.toISOString());
    
    return `/hotels?${params.toString()}`;
  }, [destination, type, min, max, options.adult, options.children, date, nights]);

  // Use the memoized buildUrl directly - no need for useState since it's already reactive
  const url = buildUrl;

  // Only fetch if we have valid search parameters
  const shouldFetch = typeof options.adult === 'number' && options.adult > 0;
  const { data, loading, error, reFetch } = useFetch(shouldFetch ? url : null);

  const handleClick = () => {
    reFetch();
  };

  const handleOptionChange = (name, value) => {
    // Handle empty string case - allow it temporarily for better UX
    if (value === '') {
      setOptions(prev => ({
        ...prev,
        [name]: ''
      }));
      return;
    }
    
    const parsedValue = parseInt(value);
    // For children, allow 0 and above. For adults/rooms, allow any positive number
    if (!isNaN(parsedValue)) {
      const minValue = name === "children" ? 0 : 0; // Allow 0 temporarily for typing
      const finalValue = Math.max(parsedValue, minValue);
      
      setOptions(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }
  };

  // Calculate total guests - handle string/empty values
  const totalGuests = (typeof options.adult === 'number' ? options.adult : 0) + (typeof options.children === 'number' ? options.children : 0);
  
  // Check if we should show results
  const shouldShowResults = typeof options.adult === 'number' && options.adult > 0;

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input 
                placeholder={destination || "Where are you going?"} 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="lsItem">
              <label>Property Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="lsTypeSelect"
              >
                <option value="">All Types</option>
                <option value="Hotels">Hotels</option>
                <option value="Apartments">Apartments</option>
                <option value="Resorts">Resorts</option>
                <option value="Guest Houses">Guest Houses</option>
                <option value="Hostels">Hostels</option>
              </select>
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                date[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(date[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDate([item.selection])}
                  minDate={new Date()}
                  ranges={date}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMin(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMax(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.adult}
                    onChange={(e) => handleOptionChange("adult", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    value={options.children}
                    onChange={(e) => handleOptionChange("children", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.room}
                    onChange={(e) => handleOptionChange("room", e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
            <button className="searchButton" onClick={handleClick}>Search</button>
            
            {totalGuests > 1 && (
              <div className="guestCapacityInfo">
                <span>Searching for properties that can accommodate {totalGuests} guests</span>
              </div>
            )}
          </div>
          <div className="listResult">
            {!shouldShowResults ? (
              <div className="noResults">
                <h3>Invalid search parameters</h3>
                <p>Please enter a valid number of adults (minimum 1) to search for properties.</p>
              </div>
            ) : loading ? (
              <div className="loadingResults">Loading hotels...</div>
            ) : error ? (
              <div className="errorResults">Error loading hotels. Please try again.</div>
            ) : (
              <>
                {data?.length > 0 ? (
                  <>
                    <div className="resultsHeader">
                      <span className="resultsCount">
                        {data.length} {type ? `${type.toLowerCase()}` : 'properties'} found
                        {!destination && type && (
                          <span className="universalSearchNote"> (all locations)</span>
                        )}
                      </span>
                      {totalGuests > 1 && (
                        <span className="guestCapacityNote">
                          All properties can accommodate {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {data.map((item, index) => (
                      <SearchItem 
                        item={item} 
                        key={item?._id || Math.random()} 
                        dates={date}
                        options={options}
                        index={index}
                      />
                    ))}
                  </>
                ) : (
                  <div className="noResults">
                    <h3>No properties found</h3>
                    <p>
                      {totalGuests > 1 
                        ? `No properties in ${destination || "this location"} can accommodate ${totalGuests} guests. Try reducing the number of guests or changing your destination.`
                        : "Try changing your search criteria"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
