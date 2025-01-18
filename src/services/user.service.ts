import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { otpGenerator } from "../utils/keys";
import { RegisterData, UserUpdateData } from "../schema/user.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getHashedPassword } from "../utils/password";

export const register = async (data: RegisterData) => {
  try {
    const hashedPassword = await getHashedPassword(data.password);
    const user = await prisma.user.create({
      data: {
        otp: otpGenerator(),
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
      },
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("An error occurred while registering the user.");
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw new Error("Error fetching user by email: " + error);
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        resetToken: true,
        resetTokenExpires: true,
      },
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error fetching user by ID: " + error);
  }
};

export const getUserByToken = async (token: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error fetching user by reset token: " + error);
  }
};

export const getUserWithEmailAndOtp = async (email: string, otp: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email, otp },
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error fetching user by email and OTP: " + error);
  }
};

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        isVerified: true,
        role: true,
        createdAt: true,
      },
    });
    return users;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error fetching all users: " + error);
  }
};

export const updateUser = async (id: string, data: UserUpdateData) => {
  try {
    const updateData: any = {};

    if (data.fullName) updateData.fullName = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.password)
      updateData.password = await bcrypt.hash(data.password, 10);
    if (data.otp) updateData.otp = data.otp;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.role) updateData.role = data.role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error updating user: " + error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    const user = await prisma.user.delete({
      where: { id },
    });
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error("Error registering user: " + error.message);
    }
    throw new Error("Error deleting user: " + error);
  }
};
