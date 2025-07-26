import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomNumbers: [{
      roomNumberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      number: {
        type: Number,
        required: true
      }
    }],
    dates: {
      type: [Date],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    paymentMethod: {
      type: String,
      default: "credit card",
    },
    specialRequests: {
      type: String,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", ReservationSchema); 