import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/index.js';
import { initDb } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health check (used by Docker + load balancers)
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api', apiRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('[fatal] Could not connect to database:', err.message);
    // Keep the server alive so /health works and the container can be inspected.
  }
  app.listen(PORT, () => console.log(`[server] API listening on port ${PORT}`));
}

start();
