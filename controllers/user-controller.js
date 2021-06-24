const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//SignUp function
const SignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("could not create user, Please try again", 500);
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image: "http://",
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing Up failed,Please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing Up failed,Please try again", 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// Login function
const Login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, Please try again later",
      500
    );
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("Invalid credentials,could not log in", 401);
    return next(error);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in,Please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials,could not log in", 401);
    return next(error);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login in failed,Please try again", 500);
    return next(error);
  }
  res.json({userId:existingUser.id,email:existingUser.email,token:token});
};

module.exports = {
  SignUp,
  Login,
};
