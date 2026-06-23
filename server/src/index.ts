// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import userRoutes from './routes/user';
import blogRoutes from './routes/blogs';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import employerRoutes from './routes/employer';
import companyRoutes from './routes/companies';
import adminSubscriptionRoutes from './routes/adminSubscription';
import employerSubscriptionRoutes from './routes/employerSubscription';
import sponsoredRoutes from './routes/sponsored';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import logger from './lib/logger';
import { db } from './lib/db';

const app = express();
const PORT = process.env.PORT || 5000;

const windowMs = 15 * 60 * 1000; // 15 minutes

// Rate limiters
const limiter = rateLimit({
  windowMs,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const authStrictLimiter = rateLimit({
  windowMs,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

const authRegisterLimiter = rateLimit({
  windowMs,
  max: 3,
  message: 'Too many registration attempts, please try again later.',
});

const applyLimiter = rateLimit({
  windowMs,
  max: 10,
  message: 'Too many applications, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs,
  max: 10,
  message: 'Too many upload requests, please try again later.',
});

// Middleware
app.use(helmet());

// Per-route rate limiters (applied before global limiter)
app.use('/api/auth/login', authStrictLimiter);
app.use('/api/auth/admin/login', authStrictLimiter);
app.use('/api/auth/register', authRegisterLimiter);
app.use('/api/auth/employer/register', authRegisterLimiter);
app.use('/api/auth/admin/register', authRegisterLimiter);
app.use('/api/auth/forgot-password', authRegisterLimiter);
app.use('/api/auth/send-verification', authRegisterLimiter);
app.use('/api/auth/reset-password', authStrictLimiter);
app.use('/api/jobs/:jobId/apply', applyLimiter);
app.use('/api/upload', uploadLimiter);

// Global rate limiter (safety net)
app.use(limiter);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    query: req.query,
  });
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NayaJagir API',
      version: '1.0.0',
      description: 'A comprehensive job portal API with user and admin functionality',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', async (req, res) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // DB connectivity check
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error: any) {
    checks.database = `error: ${error.message}`;
    healthy = false;
    logger.error('Health check failed — database unreachable', { error: error.message });
  }

  const statusCode = healthy ? 200 : 503;
  res.status(statusCode).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/employer', employerSubscriptionRoutes);
app.use('/api/admin', adminSubscriptionRoutes);
app.use('/api', sponsoredRoutes);
app.use('/api/companies', companyRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Add error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Server started`, { port: PORT, pid: process.pid, cwd: process.cwd() });
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Health check at http://localhost:${PORT}/health`);
    logger.info(`API Docs at http://localhost:${PORT}/api-docs`);
  }
});
