import { Router } from "express";
import { check } from "express-validator";
import dotenv from "dotenv";

import {
  deleteLatestNews,
  deleteNews,
  getLatestNews,
  getMyPosts,
  postLatestNews,
  uploadNewsImage,
} from "../controllers/latestNews";
import checkAuth from "../middlewares/authCheck";

dotenv.config();
const router = Router();
router.use(checkAuth);

router.post("/upload/latestNewsImage", uploadNewsImage);

router.get("/myPosts/:userId", getMyPosts);

router.get("/", getLatestNews);

router.post(
  "/",
  [
    check("title").notEmpty().withMessage("Title cannot be blank."),
    check("description").notEmpty().withMessage("Description cannot be blank."),
    check("userId").notEmpty().withMessage("User Id cannot be blank."),
  ],
  postLatestNews
);

router.delete("/:newsId", deleteNews);

if (process.env.NODE_ENV === "development") {
  router.delete("/", deleteLatestNews);
}

export default router;
