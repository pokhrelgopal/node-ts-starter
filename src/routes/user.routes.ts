import express from "express";
import {
  register,
  login,
  logout,
  deleteUser,
  forgotPassword,
  getUserById,
  getUsers,
  setNewPassword,
  updateUser,
  getMe,
  verifyUser,
} from "../controller/user.controller";
import { authMiddleware } from "../middleware.ts/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.get("/me", authMiddleware, getMe);
router.post("/set-new-password", setNewPassword);
router.post("/verify", verifyUser);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
