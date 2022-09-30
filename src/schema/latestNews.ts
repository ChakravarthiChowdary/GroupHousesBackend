import { Schema, Model, Document, model, Types } from "mongoose";

interface ILatestNews extends Document {
  title: string;
  description: string;
  userId: string;
  createdDate: Date;
  likes?: number;
  userPhoto?: string;
  photoUrls: string[];
  likedUsers?: string[];
  favUsers?: string[];
  favCount?: number;
}

const LatestSchema: Schema<ILatestNews> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, required: true },
  createdDate: { type: Date, required: true },
  likes: { type: Number, required: false },
  userPhoto: { type: String, required: false },
  photoUrls: { type: [String], required: true },
  likedUsers: { type: [String], required: false },
  favUsers: { type: [String], required: false },
  favCount: { type: Number, required: false },
});

LatestSchema.set("toObject", {
  getters: true,
});

const LatestModel: Model<ILatestNews> = model("LatestNews", LatestSchema);

export default LatestModel;
