import mongoose from 'mongoose';

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
      type: String, // 'daily' or 'weekly'
      enum: ['daily', 'weekly', 'as_needed'],
      required: true,
    },
    consumptionRate: {
      type: Number, // e.g., 2 (meaning 2 per day/week based on frequency)
      required: true,
    },
    stockLeft: {
      type: Number, // e.g., 23
      required: true,
      default: 0,
    },
    packSize: {
      type: String, // e.g., '40 Tablets (1 Strip)'
      required: true,
    },
    photo: {
      type: String, // URL/path to the uploaded image
      default: 'default_medicine.png',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links medicine to the admin who created it
    },
  },
  {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;