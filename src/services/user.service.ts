import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { UserRegister, UserUpdate } from "../types/user";
import { otpGenerator } from "../utils/keys";
export const register = async (data: UserRegister) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      otp: otpGenerator(),
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
    },
  });
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const getUserByToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
    },
  });
  return user;
};

export const getUserWithEmailAndOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      otp,
    },
  });
  return user;
};

export const getAllUsers = async () => {
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
};

export const updateUser = async (id: string, data: UserUpdate) => {
  const user = await prisma.user.update({
    where: {
      id,
    },
    data,
  });
  return user;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.delete({
    where: {
      id,
    },
  });
  return user;
};
