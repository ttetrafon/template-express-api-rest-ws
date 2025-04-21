import express from 'express';
import { requestHandler } from '../helper/handler.js';

const router = express.Router();

router.get('/', (req, res) => {
  requestHandler(req, res, () => {
    return { message: 'Hello from the root route!' };
  });
});

export default router;