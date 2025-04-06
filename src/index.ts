import express from 'express';
import cors from 'cors';

import { ENV } from './config/env';
import logger from './config/logger';
import router from './routes';

// Initialize app
const app = express();
const PORT = ENV.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api', router);

// Listener
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});