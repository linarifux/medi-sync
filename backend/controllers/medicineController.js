import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';
import { calculateNextOrderDate } from '../utils/calculateStock.js';

// @desc    Get all medicines (Includes dynamic stock calculations)
// @route   GET /api/medicines
// @access  Private
export const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({});

  // Map through medicines and attach dynamic stock data before sending to frontend
  const medicinesWithStockInfo = medicines.map((med) => {
    const stockInfo = calculateNextOrderDate(med.stockLeft, med.consumptionRate, med.frequency);
    return {
      ...med._doc,
      stockInfo,
    };
  });

  res.json(medicinesWithStockInfo);
});

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Private
export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    const stockInfo = calculateNextOrderDate(medicine.stockLeft, medicine.consumptionRate, medicine.frequency);
    res.json({
      ...medicine._doc,
      stockInfo,
    });
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private/Admin
export const createMedicine = asyncHandler(async (req, res) => {
  const { name, dosage, frequency, consumptionRate, stockLeft, packSize } = req.body;
  
  // Use Cloudinary URL if uploaded, otherwise use a generic placeholder
  const photoPath = req.file ? req.file.path : 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; 

  const medicine = new Medicine({
    name,
    dosage,
    frequency,
    consumptionRate,
    stockLeft,
    packSize,
    photo: photoPath,
    adminId: req.user._id,
  });

  const createdMedicine = await medicine.save();
  res.status(201).json(createdMedicine);
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
export const updateMedicine = asyncHandler(async (req, res) => {
  const { name, dosage, frequency, consumptionRate, stockLeft, packSize } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    medicine.name = name || medicine.name;
    medicine.dosage = dosage || medicine.dosage;
    medicine.frequency = frequency || medicine.frequency;
    medicine.consumptionRate = consumptionRate || medicine.consumptionRate;
    medicine.stockLeft = stockLeft !== undefined ? stockLeft : medicine.stockLeft;
    medicine.packSize = packSize || medicine.packSize;

    // Update photo only if a new file is uploaded
    if (req.file) {
      medicine.photo = req.file.path; // Save new Cloudinary URL
    }

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    await medicine.deleteOne();
    res.json({ message: 'Medicine removed successfully' });
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});