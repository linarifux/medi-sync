import mongoose from 'mongoose';

// Sub-schema for Restock/Order History
const orderSchema = new mongoose.Schema({
  stripsBought: { type: Number, required: true },
  totalUnitsAdded: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  source: { type: String, trim: true },
  purchaseDate: { type: Date, default: Date.now },
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
    
    // NEW: Additional Info for Medicine Details Page
    purpose: { 
      type: String,
      trim: true
    },
    instructions: { 
      type: String,
      trim: true
    },

    // NEW: Lazy Evaluation Timestamp for Nightly Deductions
    lastDeductedAt: {
      type: Date,
      default: Date.now,
    },

    // NEW: Embedded array to track purchases from the Restock Hub
    orderHistory: [orderSchema],

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