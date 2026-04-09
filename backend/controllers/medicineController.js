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

  // --- 🐛 DEBUG LOGS (Watch your backend terminal!) ---
  console.log(`\n📦 Checking: ${medicine.name}`);
  console.log(`   - Today (Dhaka): ${todayStart.format('YYYY-MM-DD')}`);
  console.log(`   - Last Deducted: ${lastDeductedStart.format('YYYY-MM-DD')}`);
  console.log(`   - Days Passed: ${daysPassed}`);
  // ----------------------------------------------------

  // If days have passed and we have stock left, we need to deduct!
  if (daysPassed > 0 && medicine.stockLeft > 0) {
    const unitsPerDose = medicine.consumptionRate || 1;
    const f = (medicine.frequency || '').toLowerCase();
    
    let unitsToDeduct = 0;
    let daysToAdvance = 0;

    if (f.includes('weekly')) {
      // Calculate how many FULL weeks have passed
      const weeksPassed = Math.floor(daysPassed / 7);
      if (weeksPassed > 0) {
        unitsToDeduct = weeksPassed * unitsPerDose;
        daysToAdvance = weeksPassed * 7; // Only advance the clock by full weeks to preserve remainder days
      }
    } else {
      // Daily, twice daily, thrice daily, etc.
      let dosesPerDay = 1;
      if (f.includes('twice') || f.includes('2')) dosesPerDay = 2;
      else if (f.includes('thrice') || f.includes('3')) dosesPerDay = 3;
      else if (f.includes('four') || f.includes('4')) dosesPerDay = 4;
      
      unitsToDeduct = daysPassed * unitsPerDose * dosesPerDay;
      daysToAdvance = daysPassed; // Advance the clock by all days passed
    }

    console.log(`   - Calculated Deduction: ${unitsToDeduct} units`);

    if (unitsToDeduct > 0) {
      medicine.stockLeft = Math.max(0, medicine.stockLeft - unitsToDeduct);
      
      // Advance the clock by the exact processed days (preserves remainders for weekly meds)
      medicine.lastDeductedAt = lastDeductedStart.clone().add(daysToAdvance, 'days').toDate();
      
      await medicine.save();
      console.log(`   ✅ DEDUCTED! New Stock Left: ${medicine.stockLeft}`);
    } else {
      console.log(`   ⚠️ Skipped deduction (Likely a weekly med that hasn't hit 7 full days yet).`);
    }
  } else if (daysPassed === 0) {
    console.log(`   ⏭️ Skipped: 0 days have passed since the last deduction.`);
  } else if (medicine.stockLeft <= 0) {
    console.log(`   ⏭️ Skipped: Stock is already empty.`);
  }

  return medicine;
};


// @desc    Get all medicines (Includes dynamic stock calculations & catch-up logic)
// @route   GET /api/medicines
// @access  Private
export const getMedicines = asyncHandler(async (req, res) => {
  let medicines = await Medicine.find({});

  // Run catch-up logic and calculate frontend stock info concurrently
  const medicinesWithStockInfo = await Promise.all(
    medicines.map(async (med) => {
      const updatedMed = await processCatchUpDeductions(med);
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
  
  const photoPath = req.file ? req.file.path : 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; 

  const medicine = new Medicine({
    name,
    dosage,
    frequency,
    consumptionRate,
    stockLeft,
    packSize,
    purpose,
    instructions,
    photo: photoPath,
    adminId: req.user._id,
    lastDeductedAt: moment().tz('Asia/Dhaka').toDate(), // Enforce Dhaka time immediately
  });

  const createdMedicine = await medicine.save();
  res.status(201).json(createdMedicine);
});


// @desc    Update a medicine (Handles Edits, Restocks, and Consumption Logging)
// @route   PUT /api/medicines/:id
// @access  Private
export const updateMedicine = asyncHandler(async (req, res) => {
  const { 
    name, dosage, frequency, consumptionRate, 
    stockLeft, packSize, purpose, instructions, 
    latestOrder, 
    consumptionRecord // NEW: Handle incoming consumption logs
  } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    medicine.name = name || medicine.name;
    medicine.dosage = dosage || medicine.dosage;
    medicine.frequency = frequency || medicine.frequency;
    medicine.consumptionRate = consumptionRate || medicine.consumptionRate;
    
    // Only update stockLeft manually if specifically provided by the frontend
    if (stockLeft !== undefined) {
      medicine.stockLeft = stockLeft;
    }

    medicine.packSize = packSize || medicine.packSize;
    medicine.purpose = purpose || medicine.purpose;
    medicine.instructions = instructions || medicine.instructions;

    // Handle Restock History
    if (latestOrder) {
      medicine.orderHistory.push(latestOrder);
    }

    // NEW: Handle Consumption History
    // If the frontend sends a 'consumptionRecord' object, push it to the history
    if (consumptionRecord) {
      // Automatically attach the ID of the user performing this action
      consumptionRecord.recordedBy = req.user._id;
      // Push to the beginning of the array so the newest logs are first (optional, but helpful)
      medicine.consumptionHistory.unshift(consumptionRecord); 
    }

    if (req.file) {
      medicine.photo = req.file.path; 
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