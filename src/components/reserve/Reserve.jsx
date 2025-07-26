import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import "./reserve.css";
import useFetch from "../../hooks/useFetch";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../context/SearchContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Reserve = ({ setOpen, hotelId }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
  const { data, loading, error } = useFetch(`/hotels/room/${hotelId}`);
  const { dates = [], options = {} } = useContext(SearchContext) || {};
  const [reservationError, setReservationError] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [capacityError, setCapacityError] = useState("");
  const [selectedRoomsData, setSelectedRoomsData] = useState([]);
  const navigate = useNavigate();

  // Default dates if not available in context
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const defaultDates = [{
    startDate: today,
    endDate: tomorrow,
    key: "selection"
  }];

  // Use context dates if available, otherwise use defaults
  const bookingDates = dates && dates.length > 0 ? dates : defaultDates;
  
  // Total number of guests
  const totalGuests = (options.adult || 1) + (options.children || 0);

  // Calculate current capacity of selected rooms
  const [currentCapacity, setCurrentCapacity] = useState(0);
  
  useEffect(() => {
    // Update selected rooms data when selections change
    if (data && data.length > 0) {
      const selectedRoomsInfo = data
        .filter(room => selectedRooms.some(id => room.roomNumbers.some(rn => rn._id === id)))
        .map(room => ({
          id: room._id,
          title: room.title,
          maxPeople: room.maxPeople,
          roomNumbers: room.roomNumbers
            .filter(rn => selectedRooms.includes(rn._id))
            .map(rn => rn.number)
        }));
      
      setSelectedRoomsData(selectedRoomsInfo);
      
      // Calculate total capacity
      const capacity = selectedRoomsInfo.reduce((total, room) => {
        return total + (room.maxPeople * room.roomNumbers.length);
      }, 0);
      
      setCurrentCapacity(capacity);
      
      // Clear capacity error if enough capacity
      if (capacity >= totalGuests) {
        setCapacityError("");
      }
    }
  }, [selectedRooms, data, totalGuests]);

  const getDatesInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const alldates = getDatesInRange(bookingDates[0]?.startDate, bookingDates[0]?.endDate);

  const isAvailable = (roomNumber) => {
    if (!roomNumber || !roomNumber.unavailableDates || !alldates || alldates.length === 0) {
      return true;
    }
    
    // Convert all unavailable dates to YYYY-MM-DD format for easier comparison
    const unavailableDatesFormatted = roomNumber.unavailableDates.map(date => 
      new Date(date).toISOString().split('T')[0]
    );
    
    // Convert all requested dates to YYYY-MM-DD format
    const requestedDatesFormatted = alldates.map(date => 
      new Date(date).toISOString().split('T')[0]
    );
    
    // Check if any requested date is in the unavailable dates
    const isUnavailable = requestedDatesFormatted.some(date => 
      unavailableDatesFormatted.includes(date)
    );
    
    return !isUnavailable;
  };

  const handleSelect = (e, roomNumber, roomId, maxPeople) => {
    const checked = e.target.checked;
    const value = e.target.value;
    
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
    
    setSelectedRoomNumbers(
      checked
        ? [...selectedRoomNumbers, { roomId, roomNumber, maxPeople }]
        : selectedRoomNumbers.filter((item) => item.roomId !== value)
    );
  };

  const handleClick = async () => {
    setReservationError("");
    setCapacityError("");
    
    if (selectedRooms.length === 0) {
      setReservationError("Please select at least one room");
      return;
    }
    
    if (!alldates || alldates.length === 0) {
      setReservationError("Please select dates for your stay");
      return;
    }
    
    // Check if selected rooms have enough capacity for all guests
    if (currentCapacity < totalGuests) {
      setCapacityError(`Your selection can only accommodate ${currentCapacity} guests. You need capacity for ${totalGuests} guests.`);
      return;
    }
    
    try {
      setReservationSuccess(true);
      
      // Convert dates from timestamps to ISO strings for proper storage
      const formattedDates = alldates.map(date => new Date(date).toISOString());
      
      // Track successful updates and already booked rooms
      let successCount = 0;
      const alreadyBookedRooms = [];
      
      const results = await Promise.all(
        selectedRooms.map(async (roomId) => {
          try {
            const res = await axios.put(`/rooms/availability/${roomId}`, {
              dates: formattedDates,
            });
            
            if (res.data.success) {
              // Check if the room was already booked
              if (res.data.alreadyBooked) {
                // Find the room number for this roomId
                const roomNumber = selectedRoomNumbers.find(r => r.roomId === roomId)?.roomNumber;
                alreadyBookedRooms.push(roomNumber || roomId);
              } else {
                successCount++;
              }
            }
            
            return res.data;
          } catch (err) {
            console.error(`Error updating room ${roomId}:`, err);
            throw err;
          }
        })
      );
      
      console.log(`Successfully updated ${successCount} out of ${selectedRooms.length} rooms`);
      
      // Check if any rooms were already booked
      if (alreadyBookedRooms.length > 0) {
        setReservationSuccess(false);
        setReservationError(`Room(s) ${alreadyBookedRooms.join(", ")} already booked for these dates. Please select different dates or rooms.`);
        return;
      }
      
      // Create a reservation in the database if you have a reservation endpoint
      try {
        // This is optional - if you have a reservations API endpoint
        // const reservationData = {
        //   userId: "user-id", // You would get this from auth context
        //   hotelId,
        //   roomIds: selectedRooms,
        //   dates: formattedDates,
        //   // other reservation details
        // };
        // await axios.post("/reservations", reservationData);
      } catch (reservationErr) {
        console.error("Error creating reservation record:", reservationErr);
        // Continue with success flow even if this fails
      }
      
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        setOpen(false);
        // Redirect to home page instead of back to the hotel page
        navigate("/", { 
          state: { 
            reserved: true,
            hotelId,
            rooms: selectedRoomNumbers.map(r => r.roomNumber),
            dates: {
              startDate: formatDate(bookingDates[0]?.startDate),
              endDate: formatDate(bookingDates[0]?.endDate)
            }
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error("Error during reservation:", err);
      setReservationError("There was a problem with your reservation. Please try again.");
      setReservationSuccess(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };
  
  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpen(false)}
        />
        <h2>Reserve Your Room</h2>
        
        <div className="rGuestInfo">
          <span className="rGuestCount">Guests: {totalGuests} ({options.adult || 1} adults, {options.children || 0} children)</span>
        </div>
        
        {bookingDates && bookingDates[0] && (
          <div className="rDates">
            <span>Your stay: </span>
            <strong>
              {formatDate(bookingDates[0].startDate)} to {formatDate(bookingDates[0].endDate)}
            </strong>
          </div>
        )}
        
        {reservationSuccess && (
          <div className="rSuccess">
            Reservation successful! Redirecting...
          </div>
        )}
        
        {reservationError && (
          <div className="rError">
            {reservationError}
          </div>
        )}
        
        {capacityError && (
          <div className="rCapacityError">
            {capacityError}
          </div>
        )}
        
        {loading ? (
          <div className="rLoading">Loading available rooms...</div>
        ) : error ? (
          <div className="rError">Error loading rooms. Please try again.</div>
        ) : (
          <>
            {data && data.length > 0 ? (
              <>
                <span className="rSelectTitle">Select your rooms:</span>
                <div className="rCapacityInfo">
                  <div className="rCapacityMeter">
                    <div 
                      className="rCapacityFill" 
                      style={{ 
                        width: `${Math.min(100, (currentCapacity / totalGuests) * 100)}%`,
                        backgroundColor: currentCapacity >= totalGuests ? "#4caf50" : "#ff9800"
                      }}
                    ></div>
                  </div>
                  <span className="rCapacityText">
                    Capacity: {currentCapacity}/{totalGuests} guests
                  </span>
                </div>
                
                {data.map((item) => (
                  <div className="rItem" key={item?._id || Math.random()}>
                    <div className="rItemInfo">
                      <div className="rTitle">{item?.title || "Room Title"}</div>
                      <div className="rDesc">{item?.desc || "Room Description"}</div>
                      <div className="rMax">
                        Max people: <b>{item?.maxPeople || "0"}</b>
                      </div>
                      <div className="rPrice">${item?.price || "0"} per night</div>
                    </div>
                    <div className="rSelectRooms">
                      {item?.roomNumbers?.map((roomNumber) => (
                        <div className="room" key={roomNumber?._id || Math.random()}>
                          <label>{roomNumber?.number || "Room"}</label>
                          <input
                            type="checkbox"
                            value={roomNumber?._id || ""}
                            onChange={(e) => handleSelect(e, roomNumber?.number, roomNumber?._id, item?.maxPeople)}
                            disabled={!isAvailable(roomNumber)}
                            className={!isAvailable(roomNumber) ? "rRoomDisabled" : ""}
                          />
                          {!isAvailable(roomNumber) && <span className="rRoomUnavailable">Unavailable</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {selectedRooms.length > 0 && (
                  <div className="rSummary">
                    <div className="rSummaryTitle">Reservation Summary</div>
                    <div className="rSummaryItem">
                      <span>Selected Rooms:</span>
                      <span>{selectedRoomNumbers.map(item => item.roomNumber).join(", ")}</span>
                    </div>
                    <div className="rSummaryItem">
                      <span>Dates:</span>
                      <span>{formatDate(bookingDates[0]?.startDate)} - {formatDate(bookingDates[0]?.endDate)}</span>
                    </div>
                    <div className="rSummaryItem">
                      <span>Guest Capacity:</span>
                      <span className={currentCapacity >= totalGuests ? "rCapacitySufficient" : "rCapacityInsufficient"}>
                        {currentCapacity} / {totalGuests} required
                      </span>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleClick} 
                  className="rButton"
                  disabled={reservationSuccess || selectedRooms.length === 0 || currentCapacity < totalGuests}
                >
                  {reservationSuccess ? "Processing..." : "Reserve Now!"}
                </button>
              </>
            ) : (
              <div className="rNoRooms">No rooms available for this hotel.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reserve;