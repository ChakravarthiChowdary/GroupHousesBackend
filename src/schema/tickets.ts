import { Schema, Model, Document, model, Types } from "mongoose";

interface ITicket extends Document {
  title: string;
  description: string;
  userId: string;
  createdDate: Date;
  userPhoto: string;
  expectedResolutionDate: Date;
  category: string;
  priority: Priority;
  resolved: boolean;
}

export enum Priority {
  HIGH = 2,
  MEDIUM = 1,
  LOW = 0,
}

const TicketSchema: Schema<ITicket> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, required: true },
  createdDate: { type: Date, required: true },
  userPhoto: { type: String, required: false },
  expectedResolutionDate: { type: Date, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: Priority, required: true },
  resolved: { type: Boolean, required: true },
});

TicketSchema.set("toObject", {
  getters: true,
});

const TicketModel: Model<ITicket> = model("Tickets", TicketSchema);

export default TicketModel;
