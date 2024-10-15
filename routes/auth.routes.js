import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../middleware/middleware.js";

// Router Initialization from 'express.Router()'
const router = express.Router();

// CHECK AUTHENTICATED USER using middleware:verifyToken, checkAuth: '/check-auth
router.get("/check-auth", verifyToken, checkAuth);

// SIGN UP ROUTE: '/signup'
router.post("/signup", signup);

// LOGIN ROUTE: '/login'
router.post("/login", login);

// LOGOUT ROUTE: '/logout'
router.get("/logout", logout);

// VERIFY EMAIL: '/verify-email
router.post("/verify-email", verifyEmail);

// FORGET PASSWORD: '/forget-password'
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD: '/reset-password'
router.post("/reset-password/:token", resetPassword);
export default router;
