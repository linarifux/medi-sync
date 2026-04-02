import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import History from '../models/History.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { medicineId, quantity, pharmacyName, notes } = req.body;

  if (!medicineId || !quantity) {
    res.status(400);
    throw new Error('Medicine ID and quantity are required');
  }

  const order = new Order({
    user: req.user._id,
    medicine: medicineId,
    quantity,
    pharmacyName,
    notes,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('medicine', 'name dosage photo')
    .sort({ createdAt: -1 });
    
  res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .populate('medicine', 'name dosage photo')
    .sort({ createdAt: -1 });
    
  res.json(orders);
});

// @desc    Update order status to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status === 'delivered') {
      res.status(400);
      throw new Error('Order is already marked as delivered');
    }

    order.status = 'delivered';
    const updatedOrder = await order.save();

    // Find the associated medicine and update the actual stock
    const medicine = await Medicine.findById(order.medicine);
    
    if (medicine) {
      medicine.stockLeft += order.quantity;
      await medicine.save();

      // Automatically log this addition in the History collection
      await History.create({
        medicine: medicine._id,
        user: req.user._id, // The admin who marked it delivered
        actionType: 'restocked',
        quantity: order.quantity,
        notes: `Auto-logged from Order Delivery #${order._id}`,
      });
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status === 'delivered') {
      res.status(400);
      throw new Error('Cannot cancel a delivered order');
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});