import { PrismaClient } from '@prisma/client';
import { ENV } from './config/env';
import logger from './config/logger';
import app from './app';

const prisma = new PrismaClient();
const PORT = ENV.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('🔌 Connected to PostgreSQL database');

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('🔌 Closing PostgreSQL connection');
  await prisma.$disconnect();
  logger.info('✅ PostgreSQL connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🔌 Closing PostgreSQL connection');
  await prisma.$disconnect();
  logger.info('✅ PostgreSQL connection closed');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

startServer();