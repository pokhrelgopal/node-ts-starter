import express from "express";
import * as uc from "../controller/user.controller";
import { authMiddleware, permissionMiddleware } from "../middleware.ts";

const router = express.Router();

router.post("/register", uc.register);
router.post("/login", uc.login);
router.post("/logout", authMiddleware, uc.logout);
router.post("/forgot-password", uc.forgotPassword);
router.get("/me", authMiddleware, uc.getMe);
router.post("/set-new-password", uc.setNewPassword);
router.post("/verify", uc.verifyUser);
router.get("/", authMiddleware, uc.getUsers);
router.get("/:id", [authMiddleware, permissionMiddleware], uc.getUserById);
router.put("/:id", [authMiddleware, permissionMiddleware], uc.updateUser);
router.delete("/:id", [authMiddleware, permissionMiddleware], uc.deleteUser);

export default router;
