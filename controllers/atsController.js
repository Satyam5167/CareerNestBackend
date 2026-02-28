import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import pool from '../utils/db.js';

// ─── Common tech keywords / skills dictionary ──────────────────
const SKILL_DICTIONARY = new Set([
    // [Skills copied from user prompt...]
    'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby',
    'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua', 'haskell', 'elixir',
    'objective-c', 'assembly', 'fortran', 'cobol', 'groovy', 'clojure', 'erlang',
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'svelte',
    'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'gatsby', 'html', 'html5', 'css', 'css3', 'sass',
    'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui', 'chakra',
    'styled-components', 'jquery', 'webpack', 'vite', 'parcel', 'rollup', 'babel',
    'redux', 'mobx', 'zustand', 'recoil', 'context api', 'pwa', 'spa',
    'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'nest', 'nestjs',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot', 'asp.net',
    'rails', 'ruby on rails', 'laravel', 'symfony', 'gin', 'fiber', 'actix',
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'couchdb', 'firebase', 'firestore', 'supabase', 'sqlite',
    'oracle', 'mssql', 'mariadb', 'neo4j', 'graphql', 'prisma', 'sequelize', 'mongoose',
    'typeorm', 'knex',
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'cicd', 'github actions',
    'gitlab ci', 'circleci', 'travis ci', 'nginx', 'apache', 'linux', 'unix', 'bash',
    'shell', 'powershell', 'cloudflare', 'vercel', 'netlify', 'heroku', 'digitalocean',
    'ec2', 's3', 'lambda', 'ecs', 'eks', 'fargate', 'cloudformation',
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'jira', 'confluence', 'trello',
    'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'devops', 'microservices', 'monolith',
    'rest', 'restful', 'rest api', 'rest apis', 'graphql', 'grpc', 'soap', 'websocket',
    'websockets', 'oauth', 'jwt', 'saml', 'sso', 'rbac',
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'puppeteer',
    'pytest', 'junit', 'unittest', 'rspec', 'testing', 'unit testing', 'integration testing',
    'e2e testing', 'end-to-end testing', 'test-driven', 'qa',
    'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'nlp',
    'natural language processing', 'computer vision', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'scipy', 'opencv', 'data science',
    'data analysis', 'data engineering', 'etl', 'hadoop', 'spark', 'kafka',
    'airflow', 'tableau', 'power bi', 'looker', 'data visualization', 'statistics',
    'big data', 'data pipeline', 'data warehouse',
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
    'mobile development', 'swiftui', 'jetpack compose',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'ui/ux', 'ux',
    'ui', 'wireframing', 'prototyping', 'responsive design', 'accessibility', 'a11y',
    'leadership', 'communication', 'teamwork', 'problem solving', 'problem-solving',
    'analytical', 'project management', 'mentoring', 'presentation',
    'cybersecurity', 'penetration testing', 'owasp', 'encryption', 'security',
    'vulnerability assessment', 'firewall', 'ids', 'ips', 'siem',
    'api', 'apis', 'sdk', 'cli', 'erp', 'crm', 'saas', 'paas', 'iaas',
    'blockchain', 'web3', 'solidity', 'smart contracts', 'nft',
    'iot', 'embedded', 'rtos', 'firmware',
    'system design', 'distributed systems', 'load balancing', 'caching',
    'cdn', 'dns', 'tcp/ip', 'http', 'https', 'ssl', 'tls',
    'object-oriented', 'oop', 'functional programming', 'design patterns',
    'solid', 'dry', 'clean code', 'clean architecture', 'mvc', 'mvvm',
    'data structures', 'algorithms', 'dsa',
]);

const ALIASES = {
    'react': ['reactjs', 'react.js'],
    'node': ['nodejs', 'node.js'],
    'vue': ['vuejs', 'vue.js'],
    'next.js': ['nextjs', 'next'],
    'typescript': ['ts'],
    'javascript': ['js'],
    'python': ['py'],
    'kubernetes': ['k8s'],
    'postgresql': ['postgres', 'psql'],
    'ci/cd': ['cicd', 'continuous integration', 'continuous deployment'],
    'rest api': ['restful', 'rest apis'],
    'machine learning': ['ml'],
    'artificial intelligence': ['ai'],
    'aws': ['amazon web services'],
    'gcp': ['google cloud'],
};

// ─── Extract keywords from JD ───────────────────────────────────
function extractKeywordsFromJD(jdText) {
    const text = jdText.toLowerCase();
    const found = [];
    const multiWordSkills = [...SKILL_DICTIONARY].filter(s => s.includes(' ') || s.includes('/') || s.includes('-') || s.includes('.'));
    for (const skill of multiWordSkills) {
        if (text.includes(skill)) found.push(skill);
    }
    const words = text.replace(/[^a-z0-9#+\-./]/g, ' ').split(/\s+/).filter(Boolean);
    for (const word of words) {
        if (SKILL_DICTIONARY.has(word) && !found.some(f => f.includes(word))) {
            found.push(word);
        }
    }
    return [...new Set(found)];
}

// ─── Check keyword presence ─────────────────────────────────────
function isKeywordInResume(keyword, resumeText) {
    const lower = resumeText.toLowerCase();
    if (lower.includes(keyword)) return true;
    const alts = ALIASES[keyword] || [];
    return alts.some(alt => lower.includes(alt));
}

// ─── Post ATS Analyze Endpoint ──────────────────────────────────
export const analyzeResume = async (req, res) => {
    try {
        if (!req.file || !req.body.jd) {
            return res.status(400).json({ message: 'Resume PDF and Job Description are required' });
        }

        const userId = req.user.id;
        const jdText = req.body.jd;

        // Parse PDF
        const pdfData = await pdf(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ message: 'Could not extract text from PDF. Ensure it is text-based.' });
        }

        // Extract Keywords from JD
        const jdKeywords = extractKeywordsFromJD(jdText);
        if (jdKeywords.length === 0) {
            return res.status(400).json({ message: 'No recognizable tech keywords found in Job Description.' });
        }

        // Match
        const matched = [];
        const missing = [];
        for (const kw of jdKeywords) {
            if (isKeywordInResume(kw, resumeText)) {
                matched.push(kw);
            } else {
                missing.push(kw);
            }
        }

        const score = Math.round((matched.length / jdKeywords.length) * 100);

        // Save Score
        await pool.query(
            'INSERT INTO ats_scores (user_id, resume_name, score) VALUES ($1, $2, $3)',
            [userId, req.file.originalname, score]
        );

        res.json({
            score,
            matched,
            missing,
            total: jdKeywords.length
        });

    } catch (err) {
        console.error('ATS Controller Error:', err.message);
        res.status(500).json({ message: 'Server error during analysis' });
    }
};
