import cron from 'node-cron';
import { syncJobsWithAPI } from './controllers/jobController.js';

// Schedule job every 30 minutes
// Field: minute, hour, day of month, month, day of week
export const initCronJobs = () => {
    console.log('[Cron] Initializing auto-refresh every 30 minutes...');

    cron.schedule('*/30 * * * *', async () => {
        const now = new Date().toLocaleString();
        console.log(`[Cron] Executing scheduled sync at ${now}...`);
        try {
            const queries = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];

            const result = await syncJobsWithAPI(randomQuery, '1');
            console.log(`[Cron] Auto-sync success: Found ${result.found}, Saved ${result.count}`);
        } catch (error) {
            console.error('[Cron] Auto-sync failed:', error.message);
        }
    });

    // Optional: Run once on startup to ensure we have data
    // syncJobsWithAPI('Indian Jobs', '1');
};
