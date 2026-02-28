import pool from '../utils/db.js';

export const toggleBookmark = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
    }

    try {
        // Check if already bookmarked
        const check = await pool.query(
            'SELECT * FROM job_bookmarks WHERE user_id = $1 AND job_id = $2',
            [userId, jobId]
        );

        if (check.rows.length > 0) {
            // Remove bookmark
            await pool.query(
                'DELETE FROM job_bookmarks WHERE user_id = $1 AND job_id = $2',
                [userId, jobId]
            );
            return res.json({ message: 'Bookmark removed', isBookmarked: false });
        } else {
            // Add bookmark
            await pool.query(
                'INSERT INTO job_bookmarks (user_id, job_id) VALUES ($1, $2)',
                [userId, jobId]
            );
            return res.json({ message: 'Job bookmarked', isBookmarked: true });
        }
    } catch (error) {
        console.error('Bookmark Error:', error.message);
        res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
    }
};

export const getBookmarkedJobs = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT j.* FROM jobs j
             JOIN job_bookmarks b ON j.id = b.job_id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Bookmarks Error:', error.message);
        res.status(500).json({ message: 'Error fetching bookmarked jobs', error: error.message });
    }
};

export const getBookmarkIds = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT job_id FROM job_bookmarks WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows.map(r => r.job_id));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookmark IDs' });
    }
};
