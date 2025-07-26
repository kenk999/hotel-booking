import express from "express";
import {
  createReservation,
  getReservations,
  getReservation,
  getUserReservations,
  updateReservationStatus,
  cancelReservation
} from "../controllers/reservation.js";
import { verifyToken, verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// CREATE
router.post("/", verifyToken, createReservation);

// GET ALL
router.get("/", verifyAdmin, getReservations);

// GET BY ID
router.get("/:id", verifyUser, getReservation);

// GET USER RESERVATIONS
router.get("/user/:userId", verifyUser, getUserReservations);

// UPDATE STATUS
router.put("/status/:id", verifyAdmin, updateReservationStatus);

// CANCEL
router.put("/cancel/:id", verifyUser, cancelReservation);

export default router; 