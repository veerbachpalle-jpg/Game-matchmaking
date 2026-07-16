import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { register } from "node:module";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxcount:1
    },
    {
      name:"coverimage",
      maxcount:1
    }
  ]),registeruser
);



export default router