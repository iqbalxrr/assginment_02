import { Router } from 'express';
import { getSystemMetricsHandler } from './metrics.controller';
import { requireAuth, requireMaintainer } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// GET /api/system/metrics - Retrieve internal metrics (Maintainer only)
router.get('/metrics', requireAuth, requireMaintainer, asyncHandler(getSystemMetricsHandler));

export default router;
