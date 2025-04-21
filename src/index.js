import cors from 'cors';
import express from 'express';

import dataRoutes from './routes/data.js';
import indexRoutes from './routes/root.js';
import { Logger } from './services/Logger.js';

// Initial setup
const logger = new Logger();

// Utility to check if this module is the main entry point
const isMain = () => {
  return process.env.AWS_LAMBDA_RUNTIME_API === undefined;
};

// Create the Express app
const app = express();
const allowedOrigins = [
  'http://192.168.1.136:5173',
  'http://localhost:5173',
  'https://system-intelligence.com'
];
app.use(cors({
  origin: function (origin, callback) {
    logger.debug(`request origin: ${ origin }`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
  logger.debug(`[${ new Date().toISOString() }] ${ req.method } ${ req.originalUrl }; body=${ JSON.stringify(req.body) }`);
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/data', dataRoutes);

// Run the app
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 8080;
app.listen(PORT, HOST, () => {
  logger.info(`Server running locally on http://${ HOST }:${ PORT }`);
});
