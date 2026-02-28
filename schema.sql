-- CareerNest PostgreSQL Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Null for OAuth users
    provider VARCHAR(50) DEFAULT 'local', -- 'local' or 'google'
    oauth_id VARCHAR(255),
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    job_type VARCHAR(100),
    work_mode VARCHAR(100),
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    apply_link TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    university VARCHAR(255),
    cgpa DECIMAL(3, 2),
    graduation_year INTEGER,
    phone VARCHAR(20),
    skills TEXT[], -- Array of strings
    target_roles TEXT[],
    preferred_locations TEXT[],
    is_remote BOOLEAN DEFAULT FALSE,
    github_url TEXT,
    linkedin_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ATS Scores Table
CREATE TABLE IF NOT EXISTS ats_scores (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255), -- Can be 'anonymous' or UUID
    resume_name VARCHAR(255),
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- 6. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);
