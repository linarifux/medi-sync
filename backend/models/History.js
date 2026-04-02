import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Who logged this action
    },
    actionType: {
      type: String,
      enum: ['consumed', 'restocked'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true, // How many were consumed or added to stock
    },
    notes: {
      type: String, // Optional: e.g., "Bought from Pharmacy X" or "Skipped morning dose"
    },
  },
  { timestamps: true }
);

const History = mongoose.model('History', historySchema);
export default History;