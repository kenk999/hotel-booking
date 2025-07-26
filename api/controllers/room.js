import Room from "../models/Room.js";
import {createError} from "../utils/error.js"
import Hotel from "../models/Hotel.js";

export const createRoom=async function (req,res,next){
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
    
    try {
      // Update the hotel: add room to rooms array and update cheapestPrice if needed
      const hotel = await Hotel.findById(hotelId);
      
      if (!hotel) {
        return next(createError(404, "Hotel not found"));
      }
      
      // Add room to hotel's rooms array
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id }
      });
      
      // Update hotel's cheapestPrice if this room has a lower price
      if (!hotel.cheapestPrice || savedRoom.price < hotel.cheapestPrice) {
        await Hotel.findByIdAndUpdate(hotelId, {
          $set: { cheapestPrice: savedRoom.price }
        });
      }
      
      res.status(200).json(savedRoom);
    } catch(err) {
      // If hotel update fails, delete the room we just created
      await Room.findByIdAndDelete(savedRoom._id);
      next(err);
    }
  } catch(err) {
    next(err);
  }
}

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};
export const updateRoomAvailability = async (req, res, next) => {
  try {
    const { dates } = req.body;
    
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return next(createError(400, "Valid dates are required"));
    }
    
    // Format dates to ensure they're stored as Date objects
    const formattedDates = dates.map(date => new Date(date));
    
    // Find the room first to verify it exists and check existing unavailable dates
    const room = await Room.findOne({ "roomNumbers._id": req.params.id });
    
    if (!room) {
      return next(createError(404, "Room not found"));
    }
    
    // Find the specific room number
    const roomNumber = room.roomNumbers.find(
      rn => rn._id.toString() === req.params.id
    );
    
    if (!roomNumber) {
      return next(createError(404, "Room number not found"));
    }
    
    // Filter out dates that are already in unavailableDates to avoid duplicates
    const existingDates = roomNumber.unavailableDates.map(date => 
      date.toISOString().split('T')[0]
    );
    
    const newDates = formattedDates.filter(date => 
      !existingDates.includes(date.toISOString().split('T')[0])
    );
    
    if (newDates.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Room already booked for these dates",
        alreadyBooked: true
      });
    }
    
    // Update the room's unavailable dates with only the new dates
    const result = await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": { $each: newDates }
        },
      }
    );
    
    if (result.modifiedCount === 0) {
      return next(createError(400, "Failed to update room availability"));
    }
    
    console.log(`Room ${req.params.id} marked as unavailable for ${newDates.length} new dates`);
    
    res.status(200).json({
      success: true,
      message: `Room availability updated with ${newDates.length} new dates`,
      newDatesAdded: newDates.length,
      totalDatesRequested: formattedDates.length
    });
  } catch (err) {
    console.error("Error updating room availability:", err);
    next(err);
  }
};
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};