import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT, verifyAdmin } from "../middlewares/auth";
import {
  registeruser,
  loginuser,
  adminlogin,
  logoutuser,
  changepassword,
  addfriends,
  getcurrentuser,
  getallusers,
  deleteuserbyid,
  updateuserrole
} from "../controllers/usercontroller";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
      name:"coverimage",
      maxCount:1
    }
  ]),registeruser
);

router.route("/login").post(loginuser)
router.route("/admin/login").post(adminlogin)

router.route("/logout").post(verifyJWT, logoutuser)
router.route("/change-password").post(verifyJWT, changepassword)
router.route("/me").get(verifyJWT, getcurrentuser)
router.route("/add-friend").post(verifyJWT, addfriends)

router.route("/admin/users").get(verifyJWT, verifyAdmin, getallusers)
router.route("/admin/users/:userId").delete(verifyJWT, verifyAdmin, deleteuserbyid)
router.route("/admin/users/:userId/role").patch(verifyJWT, verifyAdmin, updateuserrole)

export default router