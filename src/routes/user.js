import express from 'express';

import { requestHandler } from '../helper/handler.js';
import { User } from '../services/User.js';

// services
const user = new User();

const router = express.Router();

// Middleware specific to the '/data' route
router.use((req, res, next) => {
  console.log(`Request received at /user:`, req.method, req.url);
  next();
});

// POST /user/login
router.get('/login/', async (req, res) => {
  await requestHandler(req, res, user.login.bind(user), true);
});

// POST /user/register
router.get('/register/', async (req, res) => {
  await requestHandler(req, res, user.newUser.bind(user), true);
});

export default router;