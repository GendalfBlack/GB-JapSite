const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const crypto = require('crypto');

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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

const hashPassword = (password) =>
    crypto.createHash('sha256').update(password).digest('hex');

const renderRegisterPage = (res, { status = 200, registerForm = {}, messages = {} } = {}) => {
    const defaultForm = {
        login: '',
        profileName: '',
        email: '',
        subscriptionId: ''
    };

    const defaultMessages = {
        registerErrors: [],
        registerSuccess: null,
        loginErrors: [],
        loginSuccess: null
    };

    res.status(status).render('register', {
        active: 'auth',
        registerForm: { ...defaultForm, ...registerForm },
        messages: { ...defaultMessages, ...messages }
    });
};

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

app.get('/register', (req, res) => {
    renderRegisterPage(res);
});

app.post('/register', async (req, res) => {
    const { login, profileName, email, password, subscriptionId } = req.body;
    const trimmedLogin = (login || '').trim();
    const trimmedProfileName = (profileName || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedSubscriptionId = (subscriptionId || '').trim();
    const errors = [];

    if (!trimmedLogin || trimmedLogin.length < 3) {
        errors.push('Вкажіть логін щонайменше з 3 символів.');
    }

    if (!trimmedProfileName || trimmedProfileName.length < 2) {
        errors.push('Ім\'я профілю має містити щонайменше 2 символи.');
    }

    if (!trimmedEmail) {
        errors.push('Вкажіть електронну адресу.');
    } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            errors.push('Електронна адреса має некоректний формат.');
        }
    }

    if (!password || password.length < 6) {
        errors.push('Пароль має містити щонайменше 6 символів.');
    }

    if (trimmedSubscriptionId && trimmedSubscriptionId.length > 32) {
        errors.push('ID підписки не може бути довшим за 32 символи.');
    }

    if (errors.length) {
        return renderRegisterPage(res, {
            status: 400,
            registerForm: {
                login: trimmedLogin,
                profileName: trimmedProfileName,
                email: trimmedEmail,
                subscriptionId: trimmedSubscriptionId
            },
            messages: { registerErrors: errors }
        });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE login = ? OR email = ? LIMIT 1',
            [trimmedLogin, trimmedEmail]
        );

        if (existing.length) {
            return renderRegisterPage(res, {
                status: 409,
                registerForm: {
                    login: trimmedLogin,
                    profileName: trimmedProfileName,
                    email: trimmedEmail,
                    subscriptionId: trimmedSubscriptionId
                },
                messages: {
                    registerErrors: ['Користувач із таким логіном або електронною адресою вже існує.']
                }
            });
        }

        const passwordHash = hashPassword(password);

        await pool.query(
            `INSERT INTO users (login, profile_name, email, password_hash, subscription_id, is_admin)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                trimmedLogin,
                trimmedProfileName,
                trimmedEmail,
                passwordHash,
                trimmedSubscriptionId || null,
                0
            ]
        );

        return renderRegisterPage(res, {
            messages: {
                registerSuccess: 'Обліковий запис успішно створено! Тепер ви можете увійти.'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return renderRegisterPage(res, {
            status: 500,
            registerForm: {
                login: trimmedLogin,
                profileName: trimmedProfileName,
                email: trimmedEmail,
                subscriptionId: trimmedSubscriptionId
            },
            messages: {
                registerErrors: ['Сталася помилка під час створення акаунта. Спробуйте ще раз пізніше.']
            }
        });
    }
});

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    const trimmedIdentifier = (identifier || '').trim();
    const errors = [];

    if (!trimmedIdentifier) {
        errors.push('Вкажіть логін або електронну адресу.');
    }

    if (!password) {
        errors.push('Вкажіть пароль.');
    }

    if (errors.length) {
        return renderRegisterPage(res, {
            status: 400,
            messages: { loginErrors: errors }
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, login, profile_name, password_hash FROM users WHERE login = ? OR email = ? LIMIT 1',
            [trimmedIdentifier, trimmedIdentifier]
        );

        if (!rows.length) {
            return renderRegisterPage(res, {
                status: 404,
                messages: { loginErrors: ['Обліковий запис не знайдено.'] }
            });
        }

        const user = rows[0];
        const hashedInput = hashPassword(password);

        if (user.password_hash !== hashedInput) {
            return renderRegisterPage(res, {
                status: 401,
                messages: { loginErrors: ['Невірний пароль.'] }
            });
        }

        const displayName = user.profile_name || user.login;
        return renderRegisterPage(res, {
            messages: { loginSuccess: `Ласкаво просимо, ${displayName}!` }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        return renderRegisterPage(res, {
            status: 500,
            messages: {
                loginErrors: ['Сталася помилка під час входу. Спробуйте ще раз пізніше.']
            }
        });
    }
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
