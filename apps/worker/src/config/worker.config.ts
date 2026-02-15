import { registerAs } from '@nestjs/config';

export default registerAs('worker', () => ({
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '10', 10),
  pollInterval: parseInt(process.env.WORKER_POLL_INTERVAL || '20', 10),
  visibilityTimeout: parseInt(process.env.WORKER_VISIBILITY_TIMEOUT || '300', 10),
  maxRetries: parseInt(process.env.WORKER_MAX_RETRIES || '3', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
}));
