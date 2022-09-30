import { Schema, Model, Document, model, Types } from "mongoose";

interface IUserProfilePic extends Document {
  title: string;
  createdDate: Date;
  photoUrl: string;
  userId: string;
}

const UserProfilePicSchema: Schema<IUserProfilePic> = new Schema({
  title: { type: String, required: true },
  createdDate: { type: Date, required: true },
  photoUrl: { type: String, required: true },
  userId: { type: String, required: true },
});

UserProfilePicSchema.set("toObject", {
  getters: true,
});

const UserProfilePicModel: Model<IUserProfilePic> = model(
  "UserProfilePic",
  UserProfilePicSchema
);

export default UserProfilePicModel;
