const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// pages
app.get('/', (req, res) => {
    res.render('index', { active: 'home' });
});

app.get('/course-management', (req, res) => {
    res.render('course-management', { active: 'courses' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { active: 'contact' });
});

app.get('/api/courses', async (req, res) => {
    try {
        const [courseRows] = await pool.query(
            `SELECT id, level_code AS levelCode, name, description
             FROM courses
             ORDER BY display_order, id`
        );

        if (!courseRows.length) {
            return res.json([]);
        }

        const [lessonRows] = await pool.query(
            `SELECT course_id AS courseId, lesson_number AS lessonNumber, title, summary
             FROM lessons
             ORDER BY course_id, lesson_number`
        );

        const lessonsByCourse = lessonRows.reduce((acc, lesson) => {
            if (!acc[lesson.courseId]) {
                acc[lesson.courseId] = [];
            }
            acc[lesson.courseId].push({
                lessonNumber: lesson.lessonNumber,
                title: lesson.title,
                summary: lesson.summary
            });
            return acc;
        }, {});

        const payload = courseRows.map(course => ({
            id: course.id,
            levelCode: course.levelCode,
            name: course.name,
            description: course.description,
            lessons: (lessonsByCourse[course.id] || []).sort((a, b) => a.lessonNumber - b.lessonNumber)
        }));

        res.json(payload);
    } catch (error) {
        console.error('Error fetching courses and lessons:', error);
        res.status(500).json({
            message: 'Unable to load courses at this time.'
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
