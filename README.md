# NEKO & KOI Academy Platform

NEKO & KOI Academy is a Node.js + Express application that showcases a Ukrainian-language marketing site for a Japanese language school and an accompanying JLPT course management dashboard. The site renders server-side views with EJS and serves an interactive front end that consumes course and lesson data from a MySQL database.

## Features
- **Home / Landing page** with welcoming hero imagery styled for the academy brand.
- **JLPT course management dashboard** that loads courses and lessons from the REST API and lets staff browse levels (N5–N1).
- **REST API** (`GET /api/courses`) that aggregates courses with their lessons for the dashboard UI.
- **MySQL schema + seed script** to bootstrap course and lesson content for all JLPT levels.
- **Accessible, responsive UI** components with ARIA attributes and keyboard-friendly level switching.

## Tech Stack
- Node.js with Express web framework
- EJS templates rendered server-side
- Vanilla JavaScript front-end logic (`public/course-management.js`)
- MySQL 8.x (via `mysql2/promise` client)
- Dotenv for environment configuration

## Repository Layout
```
public_html/server/
├── app.js                # Express application entry point
├── database/
│   └── course_lesson_seed.sql  # Schema + seed data for courses & lessons
├── public/
│   ├── course-management.js    # Client-side dashboard logic
│   ├── styles.css              # Shared styling for all pages
│   ├── img/                    # Static images (logo, hero art)
│   └── views/                  # EJS templates (pages + nav partial)
└── tmp/                        # Reserved for runtime artifacts/uploads
```

## Prerequisites
- Node.js 18+
- npm 9+
- MySQL Server 8+ (or compatible MariaDB)

## Setup
1. **Install dependencies** inside `public_html/server/`:
   ```bash
   cd public_html/server
   npm init -y                     # create package.json if you do not have one yet
   npm install express mysql2 dotenv ejs
   ```

2. **Configure environment variables** by creating a `.env` file in `public_html/server/`:
   ```ini
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=japschool
   ```

3. **Provision the database**:
   - Create the database referenced by `DB_NAME`.
   - Run the SQL script to create tables and seed data:
     ```bash
     mysql -u your_mysql_user -p japschool < public_html/server/database/course_lesson_seed.sql
     ```

4. **Start the application**:
   ```bash
   cd public_html/server
   node app.js
   ```
   The server defaults to `http://localhost:3000`.

5. **Browse the site**:
   - `http://localhost:3000/` — Home page
   - `http://localhost:3000/course-management` — JLPT course dashboard

## Development Tips
- Update the course/lesson seed file whenever curricula change, then re-run it to refresh content.
- Static assets (CSS, JS, images) live under `public_html/server/public/`. Express serves this directory automatically.
- EJS page templates are in `public_html/server/public/views/`; shared layout pieces go in the `partials/` subfolder.
- For production, configure a process manager (PM2, systemd) and secure MySQL credentials via environment secrets.

## Future Enhancements
- Add authentication and CRUD endpoints for managing courses/lessons.
- Introduce automated tests and linting (e.g., Jest, ESLint) to enforce quality.
- Expand navigation links (Kana, Contacts, Store, Reviews) into fully fledged sections.

