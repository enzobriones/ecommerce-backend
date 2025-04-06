import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const authRoutes = Router();

// Public routes
authRoutes.post('/register', AuthController.register as any);
authRoutes.post('/login', AuthController.login as any);

// Protected routes
authRoutes.post('/profile', authenticate, AuthController.getProfile as any);
authRoutes.post('/change-password', authenticate, AuthController.changePassword as any);

export default authRoutes;