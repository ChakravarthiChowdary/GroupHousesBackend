import { Router } from "express";
import { check } from "express-validator";

import {
  forgotPassword,
  signInUser,
  signUpUser,
  updatePassword,
  uploadProfileImage,
} from "../controllers/auth";

const router = Router();

router.post(
  "/signin",
  check("email").isEmail().withMessage("Email is not valid"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password should not be left blank"),
  signInUser
);

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Email is not valid"),
    check("name").not().isEmpty().withMessage("Name should not be left blank"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password should not be left blank"),
    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm Password should not be left blank"),
    check("dateOfBirth")
      .not()
      .isEmpty()
      .withMessage("Date of birth should not be left blank"),
    check("securityQuestion")
      .not()
      .isEmpty()
      .withMessage("Security question should not be left blank"),
    check("securityAnswer")
      .not()
      .isEmpty()
      .withMessage("Security answer should not be left blank"),
  ],
  signUpUser
);

router.post("/upload/userprofilepic", uploadProfileImage);

router.post(
  "/updatepassword",
  [
    check("currentPassword")
      .not()
      .isEmpty()
      .withMessage("Current password should not be left blank"),
    check("newPassword")
      .not()
      .isEmpty()
      .withMessage("New password should not be left blank"),
    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password should not be left blank"),
    check("email").isEmail().withMessage("Email should not be left blank"),
    check("userId")
      .not()
      .isEmpty()
      .withMessage("User id should not be left blank"),
  ],
  updatePassword
);

router.post(
  "/forgotpassword",
  [
    check("email").isEmail().withMessage("Email is not valid"),
    check("newPassword")
      .not()
      .isEmpty()
      .withMessage("Password should not be left blank"),
    check("confirmNewPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password should not be left blank"),
    check("securityQuestion")
      .not()
      .isEmpty()
      .withMessage("Security Question should not be left blank"),
    check("securityAnswer")
      .not()
      .isEmpty()
      .withMessage("Security Answer should not be left blank"),
    check("dateOfBirth")
      .not()
      .isEmpty()
      .withMessage("Date of birth should not be left blank"),
  ],
  forgotPassword
);

export default router;
