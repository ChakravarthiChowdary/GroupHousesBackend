import { Schema, Model, Document, model, Types } from "mongoose";

interface INewsImagePic extends Document {
  title: string;
  createdDate: Date;
  photoUrl: string;
  userId: string;
}

const NewsImagePicSchema: Schema<INewsImagePic> = new Schema({
  title: { type: String, required: true },
  createdDate: { type: Date, required: true },
  photoUrl: { type: String, required: true },
  userId: { type: String, required: true },
});

NewsImagePicSchema.set("toObject", {
  getters: true,
});

const NewsImagePicModel: Model<INewsImagePic> = model(
  "NewsImagePic",
  NewsImagePicSchema
);

export default NewsImagePicModel;
