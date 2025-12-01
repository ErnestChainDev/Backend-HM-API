require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const seedData = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const roomRoutes = require('./routes/roomRoutes');
const guestRoutes = require('./routes/guestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// ============================
// DATABASE CONNECTION
// ============================
connectDB().then(() => {
  console.log('🗄️  Database ready for operations');
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

// ============================
// MIDDLEWARE
// ============================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================
// SEED DATABASE (OPTIONAL)
// ============================
if (process.env.SEED_DATABASE === 'true') {
  console.log('🌱 Seeding database...');
  seedData().catch(err => console.error('❌ Seeding failed:', err));
}

// ============================
// ROOT ROUTE
// ============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hotel Management API',
    version: '1.0.0',
    documentation: 'Visit /api/health to verify API status',
  });
});

// ============================
// SERVER HEALTH CHECK
// ============================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: {
      status: 'connected',
      host: process.env.MONGO_URI?.split('@')[1]?.split('/')[0] || 'unknown',
    },
  });
});

// ============================
// API HEALTH CHECK
// ============================
app.get('/api/health', (req, res) => {
  const PORT = process.env.PORT || 5000;

  res.status(200).json({
    success: true,
    message: 'API is healthy',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    baseURL: `http://localhost:${PORT}/api`,
    endpoints: {
      rooms: {
        list: 'GET /api/rooms',
        create: 'POST /api/rooms',
        get: 'GET /api/rooms/:id',
        update: 'PUT /api/rooms/:id',
        delete: 'DELETE /api/rooms/:id',
      },
      guests: {
        list: 'GET /api/guests',
        create: 'POST /api/guests',
        get: 'GET /api/guests/:id',
        update: 'PUT /api/guests/:id',
        delete: 'DELETE /api/guests/:id',
        bookings: 'GET /api/guests/:id/bookings',
      },
      bookings: {
        list: 'GET /api/bookings',
        create: 'POST /api/bookings',
        get: 'GET /api/bookings/:id',
        update: 'PUT /api/bookings/:id',
        delete: 'DELETE /api/bookings/:id',
      },
    },
  });
});

// ============================
// API ROUTES
// ============================
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/bookings', bookingRoutes);

// ============================
// 404 HANDLER
// ============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    availableRoutes: {
      health: 'GET /health',
      apiHealth: 'GET /api/health',
      documentation: 'GET /',
    },
  });
});

// ============================
// ERROR HANDLER (MUST BE LAST)
// ============================
app.use(errorHandler);

// ============================
// SERVER START
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'All origins'}`);
  console.log(`🗄️  Database ready for operations`);
  console.log(`${'='.repeat(50)}\n`);
  console.log(`📍 Available URLs:`);
  console.log(`   🏠 Home: http://localhost:${PORT}/`);
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`);
  console.log(`   🏥 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`✨ API is ready for testing!`);
  console.log(`${'='.repeat(50)}\n`);
});

// ============================
// PROCESS HANDLERS
// ============================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('📢 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
