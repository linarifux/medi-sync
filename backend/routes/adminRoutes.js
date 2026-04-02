import express from 'express';
import { getUsers, deleteUser, updateUser } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect and admin middleware to ALL routes in this file
router.use(protect, admin);

// @route   /api/admin/users
router.route('/users')
  .get(getUsers);

// @route   /api/admin/users/:id
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;