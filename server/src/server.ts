import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();
export const httpServer = http.createServer(app);

// Socket.IO configuration with CORS
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware Stack
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
app.use('/api', globalLimiter);

// Mount API Routes
app.use('/api', apiRouter);

// Socket.io Connection Handler
io.on('connection', (socket) => {
  // Room joining by role & user ID
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });
});

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server (only when not in test environment)
const PORT = ENV.PORT;

export async function startServer() {
  await connectDB();
  return httpServer.listen(PORT, () => {
    console.log(`
🚀 ====================================================
🍛 Foodle API Server running in ${ENV.NODE_ENV} mode!
📡 Listening on: http://localhost:${PORT}
🌐 Client URL:   ${ENV.CLIENT_URL}
🩺 Health check: http://localhost:${PORT}/api/health
====================================================
    `);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}
