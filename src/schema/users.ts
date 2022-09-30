import { Schema, Model, Document, model } from "mongoose";
import uniqueValidatorPkg from "mongoose-unique-validator";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  photoUrl: string;
  lastLoggedIn: Date;
  isDisabled: boolean;
  lastPasswordChanged: Date;
  noOfDaysLeftToChangePassword: number;
  dateOfBirth: Date;
  securityQuestion: string;
  securityAnswer: string;
}

const uniqueValidator: any = uniqueValidatorPkg;

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  photoUrl: { type: String, required: false },
  lastLoggedIn: { type: Date, required: true },
  lastPasswordChanged: { type: Date, required: true },
  isDisabled: { type: Boolean, required: true },
  noOfDaysLeftToChangePassword: { type: Number, required: true },
  dateOfBirth: { type: Date, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
});

UserSchema.plugin(uniqueValidator);

const UserModal: Model<IUser> = model("User", UserSchema);

export default UserModal;
