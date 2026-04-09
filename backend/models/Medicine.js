import mongoose from 'mongoose';

// Sub-schema for Restock/Order History
const orderSchema = new mongoose.Schema({
  stripsBought: { type: Number, required: true },
  totalUnitsAdded: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  source: { type: String, trim: true },
  purchaseDate: { type: Date, default: Date.now },
});

// NEW: Sub-schema for the Consumption Log / Daily Tracker
const consumptionSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['taken', 'skipped', 'missed'], 
    required: true,
    default: 'taken'
  },
  notes: { type: String, trim: true },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Tracks WHICH family member/caregiver marked it as taken
  }
});

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String, // e.g., '5mg', '500mg'
      required: true,
    },
    frequency: {
      type: String, // e.g., 'daily', 'twice daily', 'weekly'
      required: true,
    },
    consumptionRate: {
      type: Number, // e.g., 1 or 2 (meaning 2 per frequency window)
      required: true,
    },
    stockLeft: {
      type: Number, // e.g., 23
      required: true,
      default: 0,
    },
    packSize: {
      type: String, // e.g., '10 Tablets (1 Strip)'
      required: true,
    },
    photo: {
      type: String, // URL/path to the uploaded image
      default: 'default_medicine.png',
    },
    
    // Additional Info for Medicine Details Page
    purpose: { 
      type: String,
      trim: true
    },
    instructions: { 
      type: String,
      trim: true
    },

    // Lazy Evaluation Timestamp for Nightly Deductions
    lastDeductedAt: {
      type: Date,
      default: Date.now,
    },

    // Embedded array to track purchases from the Restock Hub
    orderHistory: [orderSchema],

    // NEW: Embedded array to track daily intake for the Consumption Log
    consumptionHistory: [consumptionSchema],

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links medicine to the user/admin who created it
      required: true,
    },
  },
  {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;