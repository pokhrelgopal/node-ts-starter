import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { UserRegister, UserLogin } from "../types/user";
import * as userService from "../services/user.service";
import { errorResponse, successResponse } from "../utils/response";
import { getHashedPassword, validatePassword } from "../utils/password";
import { frontendUrl, jwtSecret, nodeEnv } from "../config";
import { sendResetPasswordLink } from "../utils/mailer";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: UserRegister = req.body;
  if (!data.email || !data.password || !data.fullName) {
    return errorResponse(res, "Please provide all required fields.");
  }
  try {
    const exists = await userService.getUserByEmail(data.email);
    if (exists) {
      return errorResponse(res, "User with this email already exists.");
    }
    const user = await userService.register(data);
    return successResponse(res, "User registered successfully.", {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: UserLogin = req.body;
  if (!data.email || !data.password) {
    return errorResponse(res, "Please provide all required fields.");
  }
  try {
    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      return errorResponse(res, "User not found.");
    }
    const isValid = await validatePassword(data.password, user.password);
    if (!isValid) {
      return errorResponse(res, "Invalid password.");
    }
    if (!user.isVerified) {
      return errorResponse(res, "Please verify your email address.");
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret as string,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 604800000),
    });
    return successResponse(res, "User logged in successfully.", {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("token");
    return successResponse(res, "User logged out successfully.");
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, "Email is required", null, 422);
    }
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return errorResponse(res, "User not found", null, 404);
    }
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret as string,
      { expiresIn: "1h" }
    );
    userService.updateUser(user.id, {
      resetToken,
      resetTokenExpires: new Date(Date.now() + 3600000),
    });
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    sendResetPasswordLink(email, resetUrl);
    return successResponse(res, "Password reset link sent to email.");
  } catch (error) {
    next(error);
  }
};

export const setNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return errorResponse(res, "Token and new password are required");
    }
    let payload;
    try {
      payload = jwt.verify(token, jwtSecret as string) as {
        id: string;
        email: string;
      };
    } catch (err) {
      return errorResponse(res, "Invalid or expired token", null, 400);
    }
    const user = await userService.getUserById(payload.id);
    if (!user || user.email !== payload.email) {
      return errorResponse(
        res,
        "Invalid token. User does not exist",
        null,
        400
      );
    }
    if (user.resetToken !== token) {
      return errorResponse(res, "Invalid token", null, 400);
    }
    if (
      user.resetTokenExpires &&
      new Date() > new Date(user.resetTokenExpires)
    ) {
      return errorResponse(res, "Token expired", null, 400);
    }
    await userService.updateUser(user.id, {
      password: await getHashedPassword(newPassword),
      resetToken: null,
      resetTokenExpires: null,
    });
    return successResponse(res, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return errorResponse(res, "Email and OTP are required", null, 422);
    }
    const user = await userService.getUserWithEmailAndOtp(email, otp);
    if (!user || user.otp !== otp) {
      return errorResponse(res, "Invalid email or OTP", null, 400);
    }
    await userService.updateUser(user.id, {
      isVerified: true,
      otp: null,
    });
    return successResponse(res, "User verified successfully.");
  } catch (error) {
    console.error("Error verifying user:", error);
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    return successResponse(res, "Users fetched successfully.", { users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return errorResponse(res, "User not found.", null, 404);
    }
    return successResponse(res, "User fetched successfully.", { user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const user = userService.getUserById(req.params.id);
    if (!user) {
      return errorResponse(res, "User not found.", null, 404);
    }
    const updated = await userService.updateUser(req.params.id, data);
    return successResponse(res, "User updated successfully.", {
      id: updated.id,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) {
      return errorResponse(res, "User not found.", null, 404);
    }
    userService.deleteUser(req.params.id);
    return successResponse(res, "User deleted successfully.");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById((req as any).user.userId);
    if (!user) {
      return errorResponse(res, "User not found.", null, 404);
    }
    return successResponse(res, "User fetched successfully.", { user });
  } catch (error) {
    next(error);
  }
};
