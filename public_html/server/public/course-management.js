'use strict';

class Lesson {
    constructor({ lessonNumber, title, summary = '' }) {
        this.lessonNumber = lessonNumber;
        this.title = title;
        this.summary = summary;
    }

    get displayNumber() {
        return `Lesson ${this.lessonNumber}`;
    }
}

class Course {
    constructor({ id = null, levelCode, name, description = '', lessons = [] }) {
        this.id = id;
        this.levelCode = levelCode;
        this.name = name;
        this.description = description;
        this.lessons = Array.isArray(lessons)
            ? lessons.map(lesson => (lesson instanceof Lesson ? lesson : new Lesson(lesson)))
            : [];
    }

    get hasLessons() {
        return this.lessons.length > 0;
    }
}

class CourseUI {
    constructor({ levelTabsContainer, lessonsGrid, courseTitle, courseDescription, statusMessage, lessonCardTemplate }) {
        this.levelTabsContainer = levelTabsContainer;
        this.lessonsGrid = lessonsGrid;
        this.courseTitle = courseTitle;
        this.courseDescription = courseDescription;
        this.statusMessage = statusMessage;
        this.lessonCardTemplate = lessonCardTemplate;
        this.levelButtons = new Map();
    }

    clearLevels() {
        this.levelTabsContainer.innerHTML = '';
        this.levelButtons.clear();
    }

    renderLevelTabs(courses, onSelect) {
        this.clearLevels();

        let firstCourse = null;

        courses.forEach((course, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'level-tab';
            button.dataset.level = course.levelCode;
            button.textContent = course.levelCode;
            button.addEventListener('click', () => onSelect(course));
            this.levelTabsContainer.appendChild(button);
            this.levelButtons.set(course.levelCode, button);

            if (index === 0) {
                firstCourse = course;
            }
        });

        if (!courses.length) {
            this.renderCourse(null);
            this.showStatus('No courses found. Please seed the database.');
            return;
        }

        this.hideStatus();

        if (firstCourse) {
            onSelect(firstCourse);
        }
    }

    highlightLevel(levelCode) {
        this.levelButtons.forEach((button, code) => {
            button.classList.toggle('is-active', code === levelCode);
        });
    }

    renderCourse(course) {
        if (!course) {
            this.courseTitle.textContent = 'Select a level';
            this.courseDescription.textContent = '';
            this.lessonsGrid.innerHTML = '';
            return;
        }

        this.courseTitle.textContent = `${course.levelCode} · ${course.name}`;
        this.courseDescription.textContent = course.description || '';
        this.renderLessons(course.lessons);
    }

    renderLessons(lessons) {
        this.lessonsGrid.innerHTML = '';

        if (!lessons.length) {
            this.showStatus('No lessons found for this level yet.');
            return;
        }

        this.hideStatus();

        lessons.forEach(lesson => {
            const card = this.createLessonCard();
            card.querySelector('.lesson-number').textContent = lesson.displayNumber;
            card.querySelector('.lesson-title').textContent = lesson.title;
            this.lessonsGrid.appendChild(card);
        });
    }

    createLessonCard() {
        const templateContent = this.lessonCardTemplate?.content?.firstElementChild;

        if (templateContent) {
            return templateContent.cloneNode(true);
        }

        const article = document.createElement('article');
        article.className = 'lesson-card';

        const number = document.createElement('span');
        number.className = 'lesson-number';

        const title = document.createElement('span');
        title.className = 'lesson-title';

        article.append(number, title);
        return article;
    }

    showStatus(message) {
        if (!this.statusMessage) {
            return;
        }

        this.statusMessage.textContent = message;
        this.statusMessage.hidden = false;
    }

    hideStatus() {
        if (!this.statusMessage) {
            return;
        }

        this.statusMessage.hidden = true;
    }
}

class CourseManager {
    constructor({ ui, apiEndpoint }) {
        this.ui = ui;
        this.apiEndpoint = apiEndpoint;
        this.courses = [];
        this.activeLevel = '';
    }

    async init() {
        await this.loadCourses();
    }

    setCourses(courseData = []) {
        this.courses = Array.isArray(courseData)
            ? courseData.map(course => (course instanceof Course ? course : new Course(course)))
            : [];
    }

    handleLevelSelection(course) {
        if (!course) {
            return;
        }

        this.activeLevel = course.levelCode;
        this.ui.highlightLevel(this.activeLevel);
        this.ui.renderCourse(course);
    }

    async loadCourses() {
        this.ui.showStatus('Loading courses…');

        try {
            const response = await fetch(this.apiEndpoint, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();

            if (!Array.isArray(payload)) {
                throw new Error('Unexpected payload format');
            }

            this.setCourses(payload);
            this.ui.renderLevelTabs(this.courses, course => this.handleLevelSelection(course));
        } catch (error) {
            console.error('Failed to load courses', error);
            this.courses = [];
            this.ui.clearLevels();
            this.ui.renderCourse(null);
            this.ui.showStatus('Unable to load courses right now. Please try again later.');
        }
    }
}

(function initialiseCourseManagement() {
    const levelTabsContainer = document.querySelector('.level-tabs');
    const lessonsGrid = document.getElementById('lessonsGrid');
    const courseTitle = document.getElementById('courseTitle');
    const courseDescription = document.getElementById('courseDescription');
    const statusMessage = document.getElementById('statusMessage');
    const lessonCardTemplate = document.getElementById('lessonCardTemplate');

    if (!levelTabsContainer || !lessonsGrid || !courseTitle || !statusMessage) {
        return;
    }

    const ui = new CourseUI({
        levelTabsContainer,
        lessonsGrid,
        courseTitle,
        courseDescription,
        statusMessage,
        lessonCardTemplate
    });

    const manager = new CourseManager({
        ui,
        apiEndpoint: '/api/courses'
    });

    manager.init().catch(error => {
        console.error('Initialisation failed', error);
        ui.showStatus('Unable to load courses right now. Please try again later.');
    });
})();
