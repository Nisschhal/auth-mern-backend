// get the body
// check if user with email exist already
// hash the password
// create verificationToken
// save the user with that verificiaitonToken and its expiresDate of 7 days from now
// create a jwt auth token for cookie with saved user._id;
// save the user if not in db
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.models.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
} from "../mailTrap/emails.js";

// SIGN UP LOGIC: get the data, verify the data, create a email verfication code, save the user with that code, create and set jwt auth token on cookie, send the verification email to the user
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields required!");
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ message: "User with the email already exist!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // random token betweeen 1 to 100000(inclusive)
    const verificationToken = (
      Math.floor(Math.random() * 1000000) + 1
    ).toString();

    // structure the user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours time limit
    });

    // save the user
    await user.save();

    // set the jwt auth token to response cookie
    generateTokenAndSetCookie(res, user._id);

    // send the verification code to email
    sendVerificationEmail(user.email, verificationToken);

    // return the response
    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// LOGIN IN LOGI: verify the email and password, set the authToken to cookie, and send the responde
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "Invalid Email" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credential!" });

    generateTokenAndSetCookie(res, user._id);

    user.lasLogin = Date.now();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged In Successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(`Error while login: ${error}`);
  }
};

// LOGOUT LOGI: clear the cookie with auth token
export const logout = async (req, res) => {
  res.clearCookie("token");
  res
    .status(200)
    .json({ status: true, message: "User logged out successfully!" });
};

// VERIFY THE EMAIL: check the user with that code and its expiry date, remove the verficationToken from the user, set isVerified to true, send the welcome email
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  console.log(code);
  console.log(Date.now());
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    console.log(user);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid Code!!" });

    // update the user verified fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    // send the welcome email
    await sendWelcomEmail(user.email, user.name);

    // AFTER ALL DONE SEND THE RESPONSE
    res.status(201).json({
      success: true,
      message: "User verified Successfully!",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log(`Error while verifying email ${error}`);
  }
};

// FORGET PASSWORD: verify the email, create a reset token using crypto, set the token and its expiry to user and save it, and send the reset email with that token url
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now

    // set the token to user
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send password reset email with resetToken for url
    sendResetPasswordEmail(
      email,
      `${process.env.CLIENT_URL}/reset-password/${token}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email!",
    });
  } catch (error) {
    console.log(`Error during forgot password: ${error.message}`);
  }
};

// RESET PASSWORD: get the password, hash it, remove the reset token and its expiry and save the new hashed password, and send the password reset success email
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid Token or Rest Link expires!",
      });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // save the user and remove the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    // send the reset success email
    await sendPasswordResetSuccessEmail(user.email);

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(`Error while resetting password: ${error}`);
  }
};

/** CHECK IF USER IS AUTHENTICATED:
 * extract the userId from the middleware request
 * check if user exist in db
 * send the response
 */

export const checkAuth = async (req, res) => {
  try {
    // Ensure req.userId is available and is a valid ID
    if (!req.userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not provided!" });
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!!" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(`Error while authenticating user: ${error.message}`);
  }
};
