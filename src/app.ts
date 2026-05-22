import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import metricsRoutes from './modules/metrics/metrics.routes';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/response';

const app: Application = express();

// 1. Core Security & Parsing Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Base Health Check Route
app.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, { status: 'healthy', timestamp: new Date() }, 'DevPulse API is active and healthy');
});

// 3. Register Modular Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/system', metricsRoutes);

// 4. Mount Centralized Error-handling Middleware
app.use(errorHandler);

export default app;
