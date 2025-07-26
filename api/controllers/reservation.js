import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

// Create a new reservation
export const createReservation = async (req, res, next) => {
  const {
    userId,
    hotelId,
    roomId,
    roomNumbers,
    dates,
    totalPrice,
    checkIn,
    checkOut,
    specialRequests
  } = req.body;

  try {
    // Validate required fields
    if (!userId || !hotelId || !roomId || !roomNumbers || !dates || !totalPrice || !checkIn || !checkOut) {
      return next(createError(400, "Missing required reservation information"));
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(createError(404, "Hotel not found"));
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return next(createError(404, "Room not found"));
    }

    // Validate room numbers
    for (const roomNumber of roomNumbers) {
      const roomNumberExists = room.roomNumbers.some(
        (rn) => rn._id.toString() === roomNumber.roomNumberId
      );
      
      if (!roomNumberExists) {
        return next(createError(404, `Room number with ID ${roomNumber.roomNumberId} not found`));
      }
    }

    // Create the reservation
    const newReservation = new Reservation({
      userId,
      hotelId,
      roomId,
      roomNumbers,
      dates,
      totalPrice,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      specialRequests
    });

    // Save the reservation
    const savedReservation = await newReservation.save();

    // Update room unavailable dates
    for (const roomNumber of roomNumbers) {
      await Room.updateOne(
        { "roomNumbers._id": roomNumber.roomNumberId },
        {
          $push: {
            "roomNumbers.$.unavailableDates": dates
          }
        }
      );
    }

    res.status(201).json(savedReservation);
  } catch (err) {
    next(err);
  }
};

// Get all reservations
export const getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// Get reservation by ID
export const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(createError(404, "Reservation not found"));
    }
    res.status(200).json(reservation);
  } catch (err) {
    next(err);
  }
};

// Get user reservations
export const getUserReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ userId: req.params.userId });
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// Update reservation status
export const updateReservationStatus = async (req, res, next) => {
  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    
    if (!updatedReservation) {
      return next(createError(404, "Reservation not found"));
    }
    
    res.status(200).json(updatedReservation);
  } catch (err) {
    next(err);
  }
};

// Cancel reservation
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return next(createError(404, "Reservation not found"));
    }
    
    // Only allow cancellation if status is "confirmed"
    if (reservation.status !== "confirmed") {
      return next(createError(400, "Cannot cancel a reservation that is not in confirmed status"));
    }
    
    // Update reservation status
    reservation.status = "cancelled";
    await reservation.save();
    
    // Remove dates from room unavailable dates
    for (const roomNumber of reservation.roomNumbers) {
      await Room.updateOne(
        { "roomNumbers._id": roomNumber.roomNumberId },
        {
          $pull: {
            "roomNumbers.$.unavailableDates": { $in: reservation.dates }
          }
        }
      );
    }
    
    res.status(200).json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    next(err);
  }
}; 