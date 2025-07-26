import express from "express"
const router=express.Router();
import { updateUser, deleteUser, getUser, getUsers } from "../controllers/user.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";



// router.get("/checkauthentication",verifyToken,function(req,res,next){
//     res.send("hello user, you are logged in!")
// })


// router.get("/checkuser/:id",verifyUser,function(req,res,next){
//     res.send("hello user, you are logged in and now you can delete your account!")
// })


// router.get("/checkadmin/:id",verifyAdmin,function(req,res,next){
//     res.send("hello Admin, you are logged in and now you can delete all accounts!")
// })



router.put("/:id", verifyUser,
    updateUser
);


router.delete("/:id", verifyUser,
deleteUser
);




router.get("/:id",verifyUser,
 getUser
);



router.get("/", verifyAdmin,
getUsers);
  
export default router; 
