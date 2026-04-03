import cron from 'node-cron';
import Medicine from '../models/Medicine.js';

const startCronJobs = () => {
  console.log('⏳ Initializing Cron Jobs (Timezone: Asia/Dhaka)...');

  // Schedule task to run at 23:59 (11:59 PM) every day
  cron.schedule(
    '59 23 * * *',
    async () => {
      console.log('🌙 Running nightly stock deduction job...');

      try {
        // 1. Fetch all medicines that still have stock
        const medicines = await Medicine.find({ stockLeft: { $gt: 0 } });

        let updatedCount = 0;

        // 2. Iterate and calculate deduction for each
        for (const med of medicines) {
          const unitsPerDose = med.consumptionRate || 1;
          let dosesPerDay = 0;
          const f = (med.frequency || '').toLowerCase();

          // Calculate how many doses were taken today
          if (f.includes('twice') || f.includes('2')) {
            dosesPerDay = 2;
          } else if (f.includes('thrice') || f.includes('3')) {
            dosesPerDay = 3;
          } else if (f.includes('four') || f.includes('4')) {
            dosesPerDay = 4;
          } else if (f.includes('weekly')) {
            // If it's a weekly med, we only deduct once a week. 
            // Let's deduct it if today is Sunday (0) to prevent fractional daily deductions.
            const today = new Date().getDay(); 
            if (today === 0) {
              dosesPerDay = 1;
            }
          } else {
            // Default assumes daily (1 dose per day)
            dosesPerDay = 1;
          }

          const unitsToDeduct = unitsPerDose * dosesPerDay;

          // 3. Deduct stock if necessary, ensuring it doesn't drop below 0
          if (unitsToDeduct > 0) {
            med.stockLeft = Math.max(0, med.stockLeft - unitsToDeduct);
            await med.save();
            updatedCount++;
          }
        }

        console.log(`✅ Nightly deduction complete. Updated ${updatedCount} medicines.`);
      } catch (error) {
        console.error('❌ Error running nightly stock deduction:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Dhaka', // Strictly forces Bangladeshi Time
    }
  );
};

export default startCronJobs;