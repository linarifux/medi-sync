import express from 'express';
import { logHistory, getHistory, getPdfReport } from '../controllers/historyController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// The PDF route must be defined BEFORE the /:id or generic routes
router.get('/report', protect, admin, getPdfReport);

router.route('/')
  .post(protect, logHistory)
  .get(protect, getHistory);

export default router;