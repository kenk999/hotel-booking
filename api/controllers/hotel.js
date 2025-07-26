import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export async function createHotel(req,res,next){
   
   
   
    const newHotel=new Hotel(req.body)
try{const savedHotel= await newHotel.save();
    res.status(200).json(savedHotel)

}catch(err){
   next(err);
}
}


export async function updateHotel(req,res,next){
    try{
    const updatedHotel=await Hotel.findByIdAndUpdate(req.params.id,{$set: req.body},{new:true});
    res.status(200).json(updatedHotel)
        }catch(err){
           next(err);
        }
}


export async function countByCity(req,res,next){

    const cities=req.query.cities.split(",")
    try{
const list=await Promise.all(cities.map((city)=>{
    return Hotel.countDocuments({city:city})
}))
    res.status(200).json(list)
        }catch(err){
           next(err);
        }
}



export const getHotels = async (req, res, next) => {
  try {
    const { city, type } = req.query;
    
    let query = {};
    
    // Only add city filter if city is provided and not empty
    if (city && city.trim() !== '' && city !== 'undefined') {
      query.city = city.trim();
    }
    
    // Only add type filter if type is provided and not empty
    if (type && type.trim() !== '' && type !== 'undefined') {
      query.type = type.trim();
    }
    
    const hotels = await Hotel.find(query);
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};




export async function deleteHotel(req,res,next){
    try{
await Hotel.findByIdAndDelete(req.params.id);
res.status(200).json("hotel has been deleted")
    }catch(err){
       next(err);
    }}




export async function getHotel(req,res,next){
        try{
const hotel=await Hotel.findById(req.params.id);
res.status(200).json(hotel)
    }catch(err){
        next(err);
    }}





        export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "Hotels" });
    const apartmentCount = await Hotel.countDocuments({ type: "Apartments" });
    const resortCount = await Hotel.countDocuments({ type: "Resorts" });
    const guestCount = await Hotel.countDocuments({ type: "Guest Houses" });
    const hostelCount = await Hotel.countDocuments({ type: "Hostels" });

    res.status(200).json([
      { type: "Hotels", count: hotelCount },
      { type: "Apartments", count: apartmentCount },
      { type: "Resorts", count: resortCount },
      { type: "Guest Houses", count: guestCount },
      { type: "Hostels", count: hostelCount },
    ]);
  } catch (err) {
    next(err);
  }
};



export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    
    // Check if hotel has rooms
    if (!hotel.rooms || hotel.rooms.length === 0) {
      return res.status(200).json([]);
    }
    
    try {
      // Use Promise.all to fetch all rooms in parallel
      const roomPromises = hotel.rooms.map(async (roomId) => {
        try {
          return await Room.findById(roomId);
        } catch (err) {
          console.error(`Error fetching room ${roomId}:`, err);
          return null;
        }
      });
      
      const rooms = await Promise.all(roomPromises);
      
      // Filter out null values (rooms that couldn't be found)
      const validRooms = rooms.filter(room => room !== null);
      
      console.log(`Hotel ${hotel.name} has ${hotel.rooms.length} room IDs, found ${validRooms.length} valid rooms`);
      
      res.status(200).json(validRooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      next(err);
    }
  } catch (err) {
    console.error("Error in getHotelRooms:", err);
    next(err);
  }
};