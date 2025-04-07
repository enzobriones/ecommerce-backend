import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { ENV } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import productRouter from './routes/product.routes';
import productImageRouter from './routes/product-image.routes';
import orderRouter from './routes/order.routes';
import categoryRouter from './routes/category.routes';

// Initialize app
const app = express();
const PORT = ENV.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(ENV.RATE_LIMIT_WINDOW_MS),
  max: parseInt(ENV.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRouter);
app.use('/api/products', productImageRouter);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorMiddleware as any);

export default app;
