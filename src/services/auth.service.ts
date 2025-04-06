import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { ApiError } from '../middlewares/error.middleware';
import { ENV } from '../config/env';

const prisma = new PrismaClient();

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw ApiError.conflict(
        'User with this email already exists. Please use a different email.'
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      token,
    }
  }

  static async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      token,
    }
  }

  static generateToken(id: string, email: string, role: string) {
    return jwt.sign(
      { id, email, role },
      ENV.JWT_SECRET,
      { expiresIn: '2h' }
    );
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
    };
  }
}
