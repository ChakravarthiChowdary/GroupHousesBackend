import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import JWT from "jsonwebtoken";

import HttpError from "../models/HttpError";
import User from "../schema/users";
import { checkPassword, dateDiffInDays } from "../utils/helpers";
import UserProfilePic from "../schema/userProfilePic";
import fileUpload from "express-fileupload";

export const signInUser: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      return next(new HttpError("Email or password is incorrect", 403));
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new HttpError("Email or password is incorrect", 403));
    }

    const noOfDaysLeftToChangePassword: Number = dateDiffInDays(
      new Date(user.lastPasswordChanged),
      new Date()
    );

    if (noOfDaysLeftToChangePassword >= 30) {
      return res.status(200).json({
        passwordChangeRequired: true,
        name: user.name,
        email: user.email,
        id: user.id,
        lastLoggedIn: user.lastLoggedIn,
        lastPasswordChanged: user.lastPasswordChanged,
        isDisabled: user.isDisabled,
        noOfDaysLeftToChangePassword: user.noOfDaysLeftToChangePassword,
        photoUrl: user.photoUrl,
      });
    }

    await User.findByIdAndUpdate(user._id, {
      lastLoggedIn: new Date(),
      noOfDaysLeftToChangePassword: Number(noOfDaysLeftToChangePassword),
    });

    const token = JWT.sign(
      {
        email,
        id: user.id,
        name: user.name,
        lastLoggedIn: new Date(),
        lastPasswordChanged: user.lastPasswordChanged,
        isDisabled: user.isDisabled,
      },
      "THIS_IS_A_REALLY_SUPER_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const expiresIn = new Date();

    expiresIn.setTime(expiresIn.getTime() + 60 * 60 * 1000);
    console.log(expiresIn);

    res.status(200).json({
      name: user.name,
      email: user.email,
      id: user.id,
      lastLoggedIn: user.lastLoggedIn,
      lastPasswordChanged: user.lastPasswordChanged,
      isDisabled: user.isDisabled,
      noOfDaysLeftToChangePassword: user.noOfDaysLeftToChangePassword,
      token,
      expiresIn,
      passwordChangeRequired: false,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      name,
      password,
      confirmPassword,
      photoUrl,
      dateOfBirth,
      securityAnswer,
      securityQuestion,
    } = req.body;

    const passwordErrorMessage = checkPassword(password, confirmPassword);

    if (passwordErrorMessage !== "") {
      return next(new HttpError(passwordErrorMessage, 400));
    }

    const user = await User.findOne({ email: email }).exec();

    if (user) {
      return next(new HttpError("User already exists, Try logging in", 400));
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = new User({
      name,
      email,
      photoUrl,
      lastLoggedIn: new Date(),
      lastPasswordChanged: new Date(),
      noOfDaysLeftToChangePassword: 30,
      isDisabled: false,
      password: hashedPassword,
      dateOfBirth,
      securityAnswer,
      securityQuestion,
    });

    const result = await newUser.save();
    const resultObj = result.toObject({ getters: true });

    const token = JWT.sign(
      {
        email,
        id: resultObj.id,
        name: resultObj.name,
        lastLoggedIn: new Date(),
        lastPasswordChanged: resultObj.lastPasswordChanged,
        isDisabled: resultObj.isDisabled,
      },
      "THIS_IS_A_REALLY_SUPER_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const expiresIn = new Date();

    expiresIn.setTime(expiresIn.getTime() + 60 * 60 * 1000);

    res.status(200).json({ ...resultObj, token, expiresIn });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage: RequestHandler = async (req, res, next) => {
  try {
    let image: fileUpload.UploadedFile;
    let uploadPath;
    const basicPath = "http://localhost:5000/uploads";

    const userId = req.body.userId;

    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new HttpError("No file uploaded", 400));
    }

    image = req.files.image;

    if (!image) {
      return next(new HttpError("No image attached with body", 400));
    }

    const extension = image.name.split(".")[1];

    const imageDoc = new UserProfilePic({
      title: image.name,
      photoUrl: `${basicPath}/${image.name}`,
      createdDate: new Date(),
      userId,
    });

    const result = await imageDoc.save();

    await UserProfilePic.findByIdAndUpdate(result.id, {
      photoUrl: `${basicPath}/${result.id}.${extension}`,
    });

    const updatedImage = await UserProfilePic.findById(result.id);

    if (!updatedImage) {
      return next(new HttpError("Something wrong with the server", 500));
    }

    uploadPath = __dirname + "/public/uploads/" + result.id + "." + extension;
    image.mv(uploadPath, function (err: any) {
      if (err) return res.status(500).send(err);
    });

    await User.findByIdAndUpdate(userId, {
      photoUrl: updatedImage.photoUrl,
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    next(error);
  }
};

export const updatePassword: RequestHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword, userId, email } =
      req.body;

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError("Something wrong with authentication", 403));
    }

    if (currentPassword === newPassword) {
      return next(new HttpError("New password should be different from old"));
    }

    if (confirmPassword !== newPassword) {
      return next(new HttpError("Passwords does not match", 400));
    }

    const passwordErrorMessage = checkPassword(newPassword, confirmPassword);

    if (passwordErrorMessage !== "") {
      return next(new HttpError(passwordErrorMessage, 400));
    }

    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return next(new HttpError("Your current password is incorrect", 403));
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      lastPasswordChanged: new Date(),
      lastLoggedIn: new Date(),
      noOfDaysLeftToChangePassword: 30,
    });

    const updatedUser = await User.findById(userId).exec();

    if (!updatedUser) {
      return next(new HttpError("Something wrong happened with server"));
    }

    const token = JWT.sign(
      {
        email,
        id: updatedUser.id,
        name: updatedUser.name,
        lastLoggedIn: updatedUser.lastLoggedIn,
        lastPasswordChanged: updatedUser.lastPasswordChanged,
        isDisabled: updatedUser.isDisabled,
      },
      "THIS_IS_A_REALLY_SUPER_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const expiresIn = new Date();

    expiresIn.setTime(expiresIn.getTime() + 60 * 60 * 1000);

    const resultObj = updatedUser.toObject({ getters: true });

    res.status(200).json({ ...resultObj, token });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      securityQuestion,
      securityAnswer,
      dateOfBirth,
      newPassword,
      confirmNewPassword,
    } = req.body;

    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("Passwords should match to update", 400));
    }

    const user = await User.findOne({ email }).exec();

    if (!user) {
      return next(new HttpError("Incorrect Data. Cannot change password", 400));
    }

    if (user.securityQuestion !== securityQuestion.toString()) {
      return next(new HttpError("Incorrect Data. Cannot change password", 400));
    }

    if (user.securityAnswer !== securityAnswer) {
      return next(new HttpError("Incorrect Data. Cannot change password", 400));
    }

    const savedDate = new Date(user.dateOfBirth);
    const bodyDate = new Date(dateOfBirth);

    const formatedSavedDate = `${savedDate.getDate()}-${savedDate.getMonth()}-${savedDate.getFullYear()}`;
    const formatedBodyDate = `${bodyDate.getDate()}-${bodyDate.getMonth()}-${bodyDate.getFullYear()}`;

    if (formatedBodyDate !== formatedSavedDate) {
      return next(new HttpError("Incorrect Data. Cannot change password", 400));
    }

    const passwordErrorMessage = checkPassword(newPassword, confirmNewPassword);

    if (passwordErrorMessage !== "") {
      return next(new HttpError(passwordErrorMessage, 400));
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    await User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      lastPasswordChanged: new Date(),
    });

    res.status(200).json({
      passwordUpdated: true,
    });
  } catch (error) {
    next(error);
  }
};
