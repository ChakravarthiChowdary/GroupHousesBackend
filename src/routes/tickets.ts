import { Router } from "express";
import { check } from "express-validator";
import dotenv from "dotenv";

import {
  deleteTickets,
  getUserTickets,
  markTicketsAsResolved,
  patchUserTicket,
  postTicket,
} from "../controllers/ticket";
import checkAuth from "../middlewares/authCheck";

dotenv.config();
const router = Router();

router.use(checkAuth);

router.post(
  "/ticket",
  [
    check("title").notEmpty().withMessage("Title cannot be blank."),
    check("description").notEmpty().withMessage("Description cannot be blank."),
    check("userId").notEmpty().withMessage("user ID cannot be blank."),
    check("category").notEmpty().withMessage("Category cannot be blank."),
    check("priority").notEmpty().withMessage("Priority cannot be blank."),
  ],
  postTicket
);

router.get("/ticket/:userId", getUserTickets);

router.patch(
  "/ticket",
  [
    check("userId").notEmpty().withMessage("User ID cannot be blank."),
    check("ticket").notEmpty().withMessage("Ticket cannot be blank."),
  ],
  patchUserTicket
);

router.patch(
  "/ticket/markAsResolved",
  [
    check("ticketIds")
      .isArray()
      .withMessage("Ticket Ids should be sent as an array."),
    check("userId").notEmpty().withMessage("User Id cannot be blank."),
  ],
  markTicketsAsResolved
);

if (process.env.NODE_ENV === "development") {
  router.delete("/ticket", deleteTickets);
}

export default router;
