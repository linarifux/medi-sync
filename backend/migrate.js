import mongoose from 'mongoose';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import Medicine from './models/Medicine.js'; // Adjust path if your model is named differently

dotenv.config();

const migrateDatabase = async () => {
  try {
    // Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get current time in Dhaka
    const nowInDhaka = moment().tz('Asia/Dhaka').toDate();

    // Find all medicines missing the field and update them to today
    const result = await Medicine.updateMany(
      { lastDeductedAt: { $exists: false } },
      { $set: { lastDeductedAt: nowInDhaka } }
    );

    console.log(`🎉 Migration complete! Updated ${result.modifiedCount} medicines.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();