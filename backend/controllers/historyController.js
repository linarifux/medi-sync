import asyncHandler from 'express-async-handler';
import History from '../models/History.js';
import Medicine from '../models/Medicine.js';
import { calculateNextOrderDate } from '../utils/calculateStock.js';
import { generateInventoryPDF } from '../utils/pdfGenerator.js';

// @desc    Log a new action (consume or restock)
// @route   POST /api/history
// @access  Private
export const logHistory = asyncHandler(async (req, res) => {
  const { medicineId, actionType, quantity, notes } = req.body;

  const medicine = await Medicine.findById(medicineId);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  // Update the actual stock level in the Medicine document
  if (actionType === 'consumed') {
    if (medicine.stockLeft < quantity) {
      res.status(400);
      throw new Error('Not enough stock to consume');
    }
    medicine.stockLeft -= quantity;
  } else if (actionType === 'restocked') {
    medicine.stockLeft += quantity;
  }

  await medicine.save();

  // Create the history record
  const historyLog = await History.create({
    medicine: medicineId,
    user: req.user._id,
    actionType,
    quantity,
    notes,
  });

  res.status(201).json(historyLog);
});

// @desc    Get history logs for a specific medicine or all
// @route   GET /api/history
// @access  Private
export const getHistory = asyncHandler(async (req, res) => {
  // Optional query param: /api/history?medicineId=123
  const filter = req.query.medicineId ? { medicine: req.query.medicineId } : {};

  const history = await History.find(filter)
    .populate('medicine', 'name dosage photo')
    .populate('user', 'name')
    .sort({ createdAt: -1 }); // Newest first

  res.json(history);
});

// @desc    Generate PDF Report of current stock
// @route   GET /api/history/report
// @access  Private/Admin
export const getPdfReport = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({});
  
  // Attach stock calculations so the PDF knows what is running low
  const medicinesWithStockInfo = medicines.map((med) => ({
    ...med._doc,
    stockInfo: calculateNextOrderDate(med.stockLeft, med.consumptionRate, med.frequency),
  }));

  // This will stream the PDF directly to the user's browser for download
  generateInventoryPDF(res, medicinesWithStockInfo);
});