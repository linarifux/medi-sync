import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';
import moment from 'moment-timezone';
import { calculateNextOrderDate } from '../utils/calculateStock.js';

// Helper function to process lazy stock deductions based on Bangladeshi Time
const processCatchUpDeductions = async (medicine) => {
  // 1. Get current date in Dhaka timezone
  const nowInDhaka = moment().tz('Asia/Dhaka');
  
  // 2. Get the last deducted date (fallback to createdAt if it's a new medicine)
  const lastDeducted = moment(medicine.lastDeductedAt || medicine.createdAt).tz('Asia/Dhaka');

  // 3. Strip the time so we are only comparing full calendar days
  const todayStart = nowInDhaka.clone().startOf('day');
  const lastDeductedStart = lastDeducted.clone().startOf('day');

  // 4. Find how many calendar days have passed
  const daysPassed = todayStart.diff(lastDeductedStart, 'days');

  // If days have passed and we have stock left, we need to deduct!
  if (daysPassed > 0 && medicine.stockLeft > 0) {
    const unitsPerDose = medicine.consumptionRate || 1;
    let dosesPerDay = 1;
    const f = (medicine.frequency || '').toLowerCase();

    // Determine daily dosage
    if (f.includes('twice') || f.includes('2')) dosesPerDay = 2;
    else if (f.includes('thrice') || f.includes('3')) dosesPerDay = 3;
    else if (f.includes('four') || f.includes('4')) dosesPerDay = 4;
    else if (f.includes('weekly')) {
      dosesPerDay = 1 / 7; // Deduct 1 unit for every 7 days passed
    }

    // Calculate exact units to deduct
    const unitsToDeduct = Math.floor(daysPassed * (unitsPerDose * dosesPerDay));

    if (unitsToDeduct > 0) {
      medicine.stockLeft = Math.max(0, medicine.stockLeft - unitsToDeduct);
    }
    
    // Update the timestamp to today so we don't deduct again until tomorrow
    medicine.lastDeductedAt = nowInDhaka.toDate();
    
    // Save the updated stock back to the database
    await medicine.save();
  }

  return medicine;
};


// @desc    Get all medicines (Includes dynamic stock calculations & catch-up logic)
// @route   GET /api/medicines
// @access  Private
export const getMedicines = asyncHandler(async (req, res) => {
  // Fetch all medicines (If you want it scoped to admin/user later, add { adminId: req.user._id })
  let medicines = await Medicine.find({});

  // Run catch-up logic and calculate frontend stock info concurrently
  const medicinesWithStockInfo = await Promise.all(
    medicines.map(async (med) => {
      // 1. Deduct any stock if days have passed since last check
      const updatedMed = await processCatchUpDeductions(med);
      
      // 2. Attach dynamic stock info (Next Order Date, etc.)
      const stockInfo = calculateNextOrderDate(updatedMed.stockLeft, updatedMed.consumptionRate, updatedMed.frequency);
      
      return {
        ...updatedMed._doc,
        stockInfo,
      };
    })
  );

  res.json(medicinesWithStockInfo);
});


// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Private
export const getMedicineById = asyncHandler(async (req, res) => {
  let medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    // Make sure stock is perfectly up to date before viewing details
    medicine = await processCatchUpDeductions(medicine);
    
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
  const { name, dosage, frequency, consumptionRate, stockLeft, packSize, purpose, instructions } = req.body;
  
  // Use Cloudinary URL if uploaded, otherwise use a generic placeholder
  const photoPath = req.file ? req.file.path : 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; 

  const medicine = new Medicine({
    name,
    dosage,
    frequency,
    consumptionRate,
    stockLeft,
    packSize,
    purpose,          // NEW
    instructions,     // NEW
    photo: photoPath,
    adminId: req.user._id,
    lastDeductedAt: new Date(), // Start tracking from the moment it's created
  });

  const createdMedicine = await medicine.save();
  res.status(201).json(createdMedicine);
});


// @desc    Update a medicine (Handles both general edits and Restock logic)
// @route   PUT /api/medicines/:id
// @access  Private/Admin
export const updateMedicine = asyncHandler(async (req, res) => {
  const { 
    name, dosage, frequency, consumptionRate, 
    stockLeft, packSize, purpose, instructions, latestOrder 
  } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    medicine.name = name || medicine.name;
    medicine.dosage = dosage || medicine.dosage;
    medicine.frequency = frequency || medicine.frequency;
    medicine.consumptionRate = consumptionRate || medicine.consumptionRate;
    medicine.stockLeft = stockLeft !== undefined ? stockLeft : medicine.stockLeft;
    medicine.packSize = packSize || medicine.packSize;
    medicine.purpose = purpose || medicine.purpose;             // NEW
    medicine.instructions = instructions || medicine.instructions; // NEW

    // NEW: Handle Restock / Order History
    // If the frontend sends a 'latestOrder' object, push it to the orderHistory array
    if (latestOrder) {
      medicine.orderHistory.push(latestOrder);
      // Reset the deduction timer so it doesn't accidentally double-deduct today
      medicine.lastDeductedAt = moment().tz('Asia/Dhaka').toDate(); 
    }

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