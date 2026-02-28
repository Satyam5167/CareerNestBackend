import pool from '../utils/db.js';

// Get current user's profile with user details
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT u.name, u.email, u.profile_picture, p.* 
             FROM users u 
             LEFT JOIN profiles p ON u.id = p.user_id 
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // result.rows[0] will contain user info and potentially null profile fields
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Create or Update profile (Upsert)
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            full_name,
            university,
            cgpa,
            graduation_year,
            phone,
            skills,
            target_roles,
            preferred_locations,
            is_remote,
            github_url,
            linkedin_url
        } = req.body;

        const result = await pool.query(
            `INSERT INTO profiles (
                user_id, full_name, university, cgpa, graduation_year, phone, 
                skills, target_roles, preferred_locations, is_remote, github_url, linkedin_url, updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                university = EXCLUDED.university,
                cgpa = EXCLUDED.cgpa,
                graduation_year = EXCLUDED.graduation_year,
                phone = EXCLUDED.phone,
                skills = EXCLUDED.skills,
                target_roles = EXCLUDED.target_roles,
                preferred_locations = EXCLUDED.preferred_locations,
                is_remote = EXCLUDED.is_remote,
                github_url = EXCLUDED.github_url,
                linkedin_url = EXCLUDED.linkedin_url,
                updated_at = NOW()
            RETURNING *`,
            [
                userId, full_name, university, cgpa, graduation_year, phone,
                skills, target_roles, preferred_locations, is_remote, github_url, linkedin_url
            ]
        );

        res.json({ message: 'Profile updated successfully', profile: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};
