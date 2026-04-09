import mongoose from 'mongoose';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import Medicine from './models/Medicine.js';
import { DB_NAME } from './config/constants.js';

dotenv.config();

const migrateDatabase = async () => {
  try {
    // Connect to your database
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log('✅ Connected to MongoDB');

    // Get current time in Dhaka
    // const nowInDhaka = moment().tz('Asia/Dhaka').toDate();

    // 1. Initialize lastDeductedAt for medicines missing it
    const dateResult = await Medicine.updateMany(
      { lastDeductedAt: { $exists: false } },
      { $set: { lastDeductedAt: new Date('2026-04-03T10:49:44.617+00:00') } }
    );
    console.log(dateResult);
    
    console.log(`🕒 Added 'lastDeductedAt' to ${dateResult.modifiedCount} medicines.`);

    // 2. Initialize orderHistory array for medicines missing it
    const orderResult = await Medicine.updateMany(
      { orderHistory: { $exists: false } },
      { $set: { orderHistory: [] } }
    );
    console.log(`📦 Added 'orderHistory' array to ${orderResult.modifiedCount} medicines.`);

    // 3. Initialize consumptionHistory array for medicines missing it
    const consumptionResult = await Medicine.updateMany(
      { consumptionHistory: { $exists: false } },
      { $set: { consumptionHistory: [] } }
    );
    console.log(`💊 Added 'consumptionHistory' array to ${consumptionResult.modifiedCount} medicines.`);

    // 4. Initialize purpose and instructions strings
    const infoResult = await Medicine.updateMany(
      { purpose: { $exists: false } }, // Checking one is usually enough to know they both need adding
      { $set: { purpose: '', instructions: '' } }
    );
    console.log(`📝 Added 'purpose' & 'instructions' fields to ${infoResult.modifiedCount} medicines.`);

    console.log('\n🎉 Full database migration complete! Your existing data is now fully compatible with the new features.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();