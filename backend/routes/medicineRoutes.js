import express from 'express';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById
} from '../controllers/medicineController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// @route   /api/medicines
router.route('/')
  .get(protect, getMedicines) // Both User and Admin can view medicines
  .post(protect, admin, upload.single('photo'), createMedicine); // Only Admin can create

// @route   /api/medicines/:id
router.route('/:id')
  .put(protect, admin, upload.single('photo'), updateMedicine) // Only Admin can update
  .get(protect, admin, getMedicineById) // Both User and Admin can view medicine details
  .delete(protect, admin, deleteMedicine); // Only Admin can delete

export default router;