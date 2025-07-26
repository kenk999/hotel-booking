import express from "express";
import { getHotelRooms } from "../controllers/hotel.js";
import { countByCity, countByType, createHotel, deleteHotel, getHotel, getHotels, updateHotel } from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router=express.Router();




router.get("/countByCity", countByCity);
router.get("/countByType", countByType);





router.get("/find/:id", getHotel);




router.put("/:id", verifyAdmin,
    updateHotel
);


router.delete("/:id",verifyAdmin,
deleteHotel
);




router.post("/", verifyAdmin,
createHotel
);


router.get("/", getHotels);

router.get("/room/:id", getHotelRooms);

export default router