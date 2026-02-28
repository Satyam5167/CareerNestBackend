import pool from '../utils/db.js';

export const getDashboardStats = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Total Bookmarked
        const bookmarksRes = await pool.query(
            'SELECT COUNT(*) FROM job_bookmarks WHERE user_id = $1',
            [userId]
        );
        const bookmarksCount = parseInt(bookmarksRes.rows[0].count);

        // 2. Total Applied
        const appliedRes = await pool.query(
            'SELECT COUNT(*) FROM job_applications WHERE user_id = $1',
            [userId]
        );
        const appliedCount = parseInt(appliedRes.rows[0].count);

        // 3. Active Applications (Applied + Interviewing)
        const activeRes = await pool.query(
            "SELECT COUNT(*) FROM job_applications WHERE user_id = $1 AND status IN ('Applied', 'Interviewing')",
            [userId]
        );
        const activeCount = parseInt(activeRes.rows[0].count);

        // 4. Avg ATS Score
        const atsRes = await pool.query(
            'SELECT AVG(score) FROM ats_scores WHERE user_id = $1',
            [userId]
        );
        const avgATS = Math.round(parseFloat(atsRes.rows[0].avg) || 0);

        // 5. Recent ATS list for sidebar
        const atsListRes = await pool.query(
            'SELECT resume_name as name, score, score_date FROM ats_scores WHERE user_id = $1 ORDER BY score_date DESC LIMIT 3',
            [userId]
        );

        // 6. Application History for Chart (Last 7 days)
        const historyRes = await pool.query(
            `SELECT 
                TO_CHAR(applied_at, 'Dy') as name, 
                COUNT(*) as applications 
             FROM job_applications 
             WHERE user_id = $1 AND applied_at > NOW() - INTERVAL '7 days'
             GROUP BY TO_CHAR(applied_at, 'Dy'), applied_at
             ORDER BY applied_at ASC`,
            [userId]
        );

        res.json({
            stats: {
                bookmarks: bookmarksCount,
                applied: appliedCount,
                active: activeCount,
                avgATS: avgATS
            },
            atsHistory: atsListRes.rows,
            chartData: historyRes.rows.length > 0 ? historyRes.rows : [
                { name: 'Mon', applications: 0 },
                { name: 'Tue', applications: 0 },
                { name: 'Wed', applications: 0 },
                { name: 'Thu', applications: 0 },
                { name: 'Fri', applications: 0 },
                { name: 'Sat', applications: 0 },
                { name: 'Sun', applications: 0 },
            ]
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error.message);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
