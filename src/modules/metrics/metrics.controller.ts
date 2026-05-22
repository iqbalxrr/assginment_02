import { Request, Response } from 'express';
import { pool } from '../../db';
import { sendSuccess } from '../../utils/response';

/**
 * Handles fetching internal system metrics.
 */
export async function getSystemMetricsHandler(req: Request, res: Response): Promise<void> {
  // Execute counts concurrently
  const [
    usersResult,
    issuesResult,
    bugsResult,
    featuresResult,
    statusResult,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::integer as count FROM users'),
    pool.query('SELECT COUNT(*)::integer as count FROM issues'),
    pool.query("SELECT COUNT(*)::integer as count FROM issues WHERE type = 'bug'"),
    pool.query("SELECT COUNT(*)::integer as count FROM issues WHERE type = 'feature_request'"),
    pool.query('SELECT status, COUNT(*)::integer as count FROM issues GROUP BY status'),
  ]);

  const totalUsers = usersResult.rows[0]?.count || 0;
  const totalIssues = issuesResult.rows[0]?.count || 0;
  const totalBugs = bugsResult.rows[0]?.count || 0;
  const totalFeatures = featuresResult.rows[0]?.count || 0;

  const statusBreakdown: Record<string, number> = {
    open: 0,
    in_progress: 0,
    resolved: 0,
  };
  statusResult.rows.forEach(row => {
    statusBreakdown[row.status] = row.count;
  });

  const metricsData = {
    summary: {
      total_users: totalUsers,
      total_issues: totalIssues,
      total_bugs: totalBugs,
      total_feature_requests: totalFeatures,
    },
    issues_by_status: statusBreakdown,
    database_pool: {
      total_connections: pool.totalCount,
      idle_connections: pool.idleCount,
      waiting_requests: pool.waitingCount,
    },
    system: {
      node_version: process.version,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  sendSuccess(res, metricsData, 'Internal system metrics retrieved successfully');
}
