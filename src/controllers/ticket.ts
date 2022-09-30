import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import Ticket, { Priority } from "../schema/tickets";
import User from "../schema/users";
import { dummyTicket, translations } from "../constants/translations";
import HttpError from "../models/HttpError";

/**Developer routes */
export const deleteTickets: RequestHandler = async (req, res, next) => {
  await Ticket.deleteMany();

  res.json({ success: true });
};
/** Developer route end */

export const postTicket: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, userId, priority, category } = req.body;

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const newTicket = new Ticket({
      title,
      description,
      userId,
      priority,
      category,
      createdDate: new Date(),
      expectedResolutionDate: new Date().setDate(new Date().getDate() + 3),
      userPhoto: user.photoUrl ?? "",
      resolved: false,
    });

    const result = await newTicket.save();

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserTickets: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const tickets = await Ticket.find({ userId: user.id }).exec();

    res.json({ tickets, count: tickets.length });
  } catch (error) {
    next(error);
  }
};

export const patchUserTicket: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, ticket } = req.body;

    const user = await User.findById(userId).exec();

    if (typeof ticket !== "object") {
      return next(new HttpError(translations.ticketObjectError, 400));
    }

    if (!ticket.id) {
      return next(new HttpError(translations.ticketIdNotFound, 400));
    }

    const oldTicket = await Ticket.findById(ticket.id).exec();

    if (!oldTicket) {
      return next(new HttpError(translations.ticketIdNotFound, 400));
    }

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    if (ticket.priority && !(ticket.priority in Priority)) {
      return next(new HttpError(translations.priorityNotFound, 400));
    }

    if (ticket.resolved && typeof ticket.resolved !== "boolean") {
      return next(new HttpError(translations.resolvedTypeError, 400));
    }

    for (let key in ticket) {
      if (!dummyTicket.hasOwnProperty(key)) {
        delete ticket[key];
      }
    }

    await Ticket.findByIdAndUpdate(oldTicket.id, { ...ticket });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const markTicketsAsResolved: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketIds, userId } = req.body;

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    await Ticket.updateMany(
      { _id: { $in: ticketIds }, resolved: { $eq: false }, userId: userId },
      { $set: { resolved: true } }
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const deleteUserTickets: RequestHandler = (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
