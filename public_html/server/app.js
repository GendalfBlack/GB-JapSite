const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const session = require('express-session');

const UserRepository = require('./services/UserRepository');
const AuthService = require('./services/AuthService');
const AuthController = require('./controllers/AuthController');

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

const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'development-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

const ensureAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/register#login');
    }
    next();
};

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

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

app.get('/register', authController.showRegister);
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

app.get('/profile', ensureAuthenticated, (req, res) => {
    const loginSuccess = req.session.loginSuccess;
    if (loginSuccess) {
        delete req.session.loginSuccess;
    }

    res.render('profile', {
        active: 'profile',
        profileUser: req.session.user,
        loginSuccess
    });
});

app.get('/settings', ensureAuthenticated, (req, res) => {
    res.render('settings', {
        active: 'settings'
    });
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
