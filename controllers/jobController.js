import axios from 'axios';
import pool from '../utils/db.js';
import crypto from 'crypto';

// Core logic for syncing jobs (can be called by controller or cron)
export const syncJobsWithAPI = async (queryString = 'Software Engineer', page = '1') => {
    try {
        console.log(`[Sync] Searching JSearch for: "${queryString}", page: ${page}...`);

        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params: { query: queryString, page: page, num_pages: '1' },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const jsearchJobs = response.data.data;

        if (!jsearchJobs || jsearchJobs.length === 0) {
            console.log('[Sync] No jobs found');
            return { count: 0, found: 0 };
        }

        let savedCount = 0;
        for (const job of jsearchJobs) {
            try {
                const external_id = job.job_id;
                const title = job.job_title;
                const company = job.employer_name;
                const location = `${job.job_city || ''} ${job.job_state || ''} ${job.job_country || ''}`.trim() || 'Remote';
                const job_type = job.job_employment_type;
                const work_mode = job.job_is_remote ? 'Remote' : 'Office/On-site';
                const salary_min = job.job_min_salary || null;
                const salary_max = job.job_max_salary || null;
                const description = job.job_description;
                const apply_link = job.job_apply_link;
                const posted_at = job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date();

                await pool.query(
                    `INSERT INTO jobs (id, external_id, title, company, location, job_type, work_mode, salary_min, salary_max, description, apply_link, posted_at, source) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                     ON CONFLICT (external_id) DO UPDATE SET 
                        title = EXCLUDED.title, company = EXCLUDED.company, location = EXCLUDED.location, job_type = EXCLUDED.job_type, work_mode = EXCLUDED.work_mode,
                        salary_min = EXCLUDED.salary_min, salary_max = EXCLUDED.salary_max, description = EXCLUDED.description, apply_link = EXCLUDED.apply_link,
                        is_active = TRUE, fetched_at = NOW()`,
                    [crypto.randomUUID(), external_id, title, company, location, job_type, work_mode, salary_min, salary_max, description, apply_link, posted_at, 'jsearch']
                );
                savedCount++;
            } catch (err) {
                console.error(`[Sync] Error saving ${job.job_id}:`, err.message);
            }
        }
        return { count: savedCount, found: jsearchJobs.length };
    } catch (error) {
        console.error('[Sync] API Error:', error.message);
        throw error;
    }
};

// Express Controller Wrapper
export const searchAndSyncJobs = async (req, res) => {
    try {
        const query = req.query.q || 'Software Engineer';
        const page = req.query.page || '1';
        const result = await syncJobsWithAPI(query, page);
        res.json({ message: 'Sync completed', stats: { found: result.found, synced: result.count } });
    } catch (error) {
        res.status(500).json({ message: 'Error syncing with JSearch', error: error.message });
    }
};

// Simple Get All Jobs from DB
export const getJobs = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY posted_at DESC LIMIT 50');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs from DB', error: error.message });
    }
};

export const applyToJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });

    try {
        await pool.query(
            `INSERT INTO job_applications (user_id, job_id, status) 
             VALUES ($1, $2, 'Applied')
             ON CONFLICT (user_id, job_id) DO NOTHING`,
            [userId, jobId]
        );
        res.json({ message: 'Application recorded successfully' });
    } catch (error) {
        console.error('Apply Error:', error.message);
        res.status(500).json({ message: 'Error recording application' });
    }
};
