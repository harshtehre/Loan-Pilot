import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { env } from './config.js';
import { applicationRoutes } from './routes/applications.js';
import { productRoutes } from './routes/products.js';
import { aiRoutes } from './routes/ai.js';
import { analyticsRoutes } from './routes/analytics.js';
import { reportRoutes } from './routes/reports.js';
import { documentRoutes } from './routes/documents.js';
import { teamRoutes } from './routes/team.js';
import { billingRoutes } from './routes/billing.js';
import { auditRoutes } from './routes/audit.js';
import { notificationRoutes } from './routes/notifications.js';
import { settingsRoutes } from './routes/settings.js';

const app = Fastify({ logger: true, bodyLimit: 2_000_000 });

await app.register(helmet);
await app.register(cors, { origin: env.FRONTEND_URL, credentials: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

app.get('/health', async () => ({ ok: true, service: 'loanpilot-api', timestamp: new Date().toISOString() }));
app.register(applicationRoutes);
app.register(productRoutes);
app.register(aiRoutes);
app.register(analyticsRoutes);
app.register(reportRoutes);
app.register(documentRoutes);
app.register(teamRoutes);
app.register(billingRoutes);
app.register(auditRoutes);
app.register(notificationRoutes);
app.register(settingsRoutes);

app.setErrorHandler((err, req, res) => {
  const error = err instanceof Error ? err : new Error(String(err));
  const status = typeof err === 'object' && err !== null && 'statusCode' in err && typeof err.statusCode === 'number'
    ? err.statusCode
    : 500;
  req.log.error({ err: error }, 'request failed');
  const message = process.env.NODE_ENV === 'production' && status >= 500 ? 'Internal server error' : error.message;
  return res.code(status).send({ error: message });
});

app.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error: unknown) => {
  app.log.error({ err: error }, 'server failed to start');
  process.exit(1);
});
