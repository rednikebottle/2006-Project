import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import './config/firebase'; // Ensure Firebase is initialized
import userRoutes from './routes/userRoutes';
import childrenRoutes from './routes/children';
import centersRoutes from './routes/centers';
import settingsRoutes from './routes/settings';
import bookingsRoutes from './routes/bookings';
import reviewsRouter from './routes/reviews';
import reportsRouter from './routes/reports';
import chatRoutes from './routes/chatRoutes';
import emergencyContactRoutes from './routes/emergencyContactRoutes';
import { authenticate } from './middlewares/authMiddleware';
import { setupWebSocketServer } from './websocket';

const app = express();
const server = createServer(app);

// Set up WebSocket server
setupWebSocketServer(server);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/children', authenticate, childrenRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/bookings', authenticate, bookingsRoutes);
app.use('/api/reviews', authenticate, reviewsRouter);
app.use('/api/reports', authenticate, reportsRouter);
app.use('/api/chats', authenticate, chatRoutes);
app.use('/api/emergency-contacts', authenticate, emergencyContactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Optional: global error handler
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;


