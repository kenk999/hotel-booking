import "./list.css"
import React, { useState, useEffect } from "react"
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'
import { format } from "date-fns"
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom"
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import PropertyList from "../../components/propertyList/PropertyList.jsx";

const List = () => {
  const location = useLocation();
  const [destination, setDestination] = useState(location.state?.destination || "");
  const [type, setType] = useState(location.state?.type || "");
  const [date, setDate] = useState(location.state?.date || [{
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    key: "selection"
  }]);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location.state?.options || {
    adult: 1,
    children: 0,
    room: 1
  });
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);

  // Build initial URL immediately
  const buildUrl = (dest, typ, minPrice, maxPrice, opts, dates) => {
    const params = new URLSearchParams();
    
    if (dest && dest.trim() !== '') {
      params.append('city', dest.trim());
    }
    if (typ && typ.trim() !== '') {
      params.append('type', typ.trim());
    }
    if (minPrice) params.append('min', minPrice);
    if (maxPrice) params.append('max', maxPrice);
    if (opts.adult) params.append('adult', opts.adult);
    if (opts.children) params.append('children', opts.children);
    if (dates[0]?.startDate) params.append('startDate', dates[0].startDate.toISOString());
    if (dates[0]?.endDate) params.append('endDate', dates[0].endDate.toISOString());
    
    return `/hotels?${params.toString()}`;
  };

  // Initialize URL with correct values from the start
  const [url, setUrl] = useState(() => buildUrl(destination, type, min, max, options, date));

  useEffect(() => {
    const newUrl = buildUrl(destination, type, min, max, options, date);
    setUrl(newUrl);
  }, [destination, type, min, max, options.adult, options.children, date]);

  const { data, loading, error, reFetch } = useFetch(url);

  const handleClick = () => {
    reFetch();
  };

  const handleOptionChange = (name, value) => {
    // Ensure value is at least 0 for children, and at least 1 for adults and rooms
    const minValue = name === "children" ? 0 : 1;
    const parsedValue = parseInt(value) || minValue;
    const finalValue = Math.max(parsedValue, minValue);
    
    setOptions(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Calculate total guests
  const totalGuests = options.adult + options.children;

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
            {loading ? (
              <div className="loadingResults">Loading hotels...</div>
            ) : error ? (
              <div className="errorResults">Error loading hotels. Please try again.</div>
            ) : (
              <>
                {data?.length > 0 ? (
                  <>
                    <div className="resultsHeader">
                      <span className="resultsCount">{data.length} properties found</span>
                      {totalGuests > 1 && (
                        <span className="guestCapacityNote">
                          All properties can accommodate {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {data.map((item) => (
                      <SearchItem 
                        item={item} 
                        key={item?._id || Math.random()} 
                        dates={date}
                        options={options}
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
