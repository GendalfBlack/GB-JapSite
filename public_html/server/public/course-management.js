'use strict';

class Lesson {
    constructor({ lessonNumber, title }) {
        this.lessonNumber = lessonNumber;
        this.title = title;
    }

    get displayNumber() {
        return `Lesson ${this.lessonNumber}`;
    }
}

class Course {
    constructor({ levelCode, name, description = '', lessons = [] }) {
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

    renderLevelTabs(courses, onSelect) {
        this.levelTabsContainer.innerHTML = '';
        this.levelButtons.clear();

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
    constructor({ ui, apiEndpoint, sampleCourses = [], useMockData = false }) {
        this.ui = ui;
        this.apiEndpoint = apiEndpoint;
        this.sampleCourses = sampleCourses;
        this.useMockData = useMockData;
        this.courses = [];
        this.activeLevel = '';
    }

    async init() {
        if (this.useMockData) {
            this.setCourses(this.sampleCourses);
            this.ui.renderLevelTabs(this.courses, course => this.handleLevelSelection(course));
            return;
        }

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
            const response = await fetch(this.apiEndpoint);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            this.setCourses(payload);
            this.ui.renderLevelTabs(this.courses, course => this.handleLevelSelection(course));
        } catch (error) {
            console.error('Failed to load courses', error);
            this.ui.showStatus('Unable to load courses right now. Please try again later.');
        }
    }
}

const sampleCourseData = [
    {
        levelCode: 'N5',
        name: 'JLPT N5',
        description: 'Foundational Japanese for absolute beginners.',
        lessons: [
            { lessonNumber: 1, title: 'Lesson 1: Hiragana Basics' },
            { lessonNumber: 2, title: 'Lesson 2: Greetings and Introductions' },
            { lessonNumber: 3, title: 'Lesson 3: Daily Activities Vocabulary' },
            { lessonNumber: 4, title: 'Lesson 4: Numbers and Counters' },
            { lessonNumber: 5, title: 'Lesson 5: Basic Sentence Structure' },
            { lessonNumber: 6, title: 'Lesson 6: Family and Relationships' },
            { lessonNumber: 7, title: 'Lesson 7: Time Expressions' },
            { lessonNumber: 8, title: 'Lesson 8: Adjectives and Descriptions' },
            { lessonNumber: 9, title: 'Lesson 9: Asking Questions' },
            { lessonNumber: 10, title: 'Lesson 10: Shopping Phrases' },
            { lessonNumber: 11, title: 'Lesson 11: Verb Te-form Basics' },
            { lessonNumber: 12, title: 'Lesson 12: Locations and Directions' },
            { lessonNumber: 13, title: 'Lesson 13: Particles Review' },
            { lessonNumber: 14, title: 'Lesson 14: Likes and Dislikes' },
            { lessonNumber: 15, title: 'Lesson 15: Weather and Seasons' },
            { lessonNumber: 16, title: 'Lesson 16: Verb Past Tense' },
            { lessonNumber: 17, title: 'Lesson 17: Invitations and Plans' },
            { lessonNumber: 18, title: 'Lesson 18: Transportation Vocabulary' },
            { lessonNumber: 19, title: 'Lesson 19: Restaurant Conversations' },
            { lessonNumber: 20, title: 'Lesson 20: Giving Reasons with kara' },
            { lessonNumber: 21, title: 'Lesson 21: Verb Potential Form' },
            { lessonNumber: 22, title: 'Lesson 22: Invitations with mashou' },
            { lessonNumber: 23, title: 'Lesson 23: Requests with kudasai' },
            { lessonNumber: 24, title: 'Lesson 24: Comparisons with yori' },
            { lessonNumber: 25, title: 'Lesson 25: Review and Practice' }
        ]
    },
    {
        levelCode: 'N4',
        name: 'JLPT N4',
        description: 'Lower-intermediate Japanese grammar and vocabulary.',
        lessons: [
            { lessonNumber: 1, title: 'Lesson 1: Keigo Essentials' },
            { lessonNumber: 2, title: 'Lesson 2: Complex Sentence Patterns' },
            { lessonNumber: 3, title: 'Lesson 3: Verb Te-iru Nuances' },
            { lessonNumber: 4, title: 'Lesson 4: Expressing Obligation' },
            { lessonNumber: 5, title: 'Lesson 5: Expressing Ability and Permission' },
            { lessonNumber: 6, title: 'Lesson 6: Wishes and Intentions' },
            { lessonNumber: 7, title: 'Lesson 7: Giving and Receiving Verbs' },
            { lessonNumber: 8, title: 'Lesson 8: Expressing Experience' },
            { lessonNumber: 9, title: 'Lesson 9: Conditional Forms' },
            { lessonNumber: 10, title: 'Lesson 10: Casual Speech Patterns' },
            { lessonNumber: 11, title: 'Lesson 11: Expressing Purpose' },
            { lessonNumber: 12, title: 'Lesson 12: Transitive vs. Intransitive Verbs' },
            { lessonNumber: 13, title: 'Lesson 13: Describing Preparations' },
            { lessonNumber: 14, title: 'Lesson 14: Expressing Hearsay' },
            { lessonNumber: 15, title: 'Lesson 15: Expressing Attempts' },
            { lessonNumber: 16, title: 'Lesson 16: Passive Voice Introduction' },
            { lessonNumber: 17, title: 'Lesson 17: Causative Basics' },
            { lessonNumber: 18, title: 'Lesson 18: Expressing Excess' },
            { lessonNumber: 19, title: 'Lesson 19: Expressing While Doing' },
            { lessonNumber: 20, title: 'Lesson 20: Review and Practice' }
        ]
    },
    {
        levelCode: 'N3',
        name: 'JLPT N3',
        description: 'Bridge level with intermediate grammar patterns.',
        lessons: [
            { lessonNumber: 1, title: 'Lesson 1: Nuanced Particles' },
            { lessonNumber: 2, title: 'Lesson 2: Advanced Te-form Uses' },
            { lessonNumber: 3, title: 'Lesson 3: Expressing Concessions' },
            { lessonNumber: 4, title: 'Lesson 4: Emphasis Structures' },
            { lessonNumber: 5, title: 'Lesson 5: Expressing Probability' },
            { lessonNumber: 6, title: 'Lesson 6: Passive Causative Review' },
            { lessonNumber: 7, title: 'Lesson 7: Formal Expressions' },
            { lessonNumber: 8, title: 'Lesson 8: Relative Clauses' },
            { lessonNumber: 9, title: 'Lesson 9: Expressing Intentions' },
            { lessonNumber: 10, title: 'Lesson 10: Idiomatic Expressions' },
            { lessonNumber: 11, title: 'Lesson 11: Written Japanese Styles' },
            { lessonNumber: 12, title: 'Lesson 12: Expressing Gradual Change' },
            { lessonNumber: 13, title: 'Lesson 13: Hypothetical Expressions' },
            { lessonNumber: 14, title: 'Lesson 14: Expressing Emotions' },
            { lessonNumber: 15, title: 'Lesson 15: Review and Practice' }
        ]
    },
    {
        levelCode: 'N2',
        name: 'JLPT N2',
        description: 'Upper-intermediate Japanese for academic and professional contexts.',
        lessons: [
            { lessonNumber: 1, title: 'Lesson 1: Academic Reading Strategies' },
            { lessonNumber: 2, title: 'Lesson 2: Nuanced Conditionals' },
            { lessonNumber: 3, title: 'Lesson 3: Formal Written Expressions' },
            { lessonNumber: 4, title: 'Lesson 4: Advanced Honorifics' },
            { lessonNumber: 5, title: 'Lesson 5: Expressing Criticism' },
            { lessonNumber: 6, title: 'Lesson 6: Emphatic Structures' },
            { lessonNumber: 7, title: 'Lesson 7: Academic Vocabulary' },
            { lessonNumber: 8, title: 'Lesson 8: Expressing Simultaneity' },
            { lessonNumber: 9, title: 'Lesson 9: Persuasive Writing' },
            { lessonNumber: 10, title: 'Lesson 10: Review and Practice' }
        ]
    },
    {
        levelCode: 'N1',
        name: 'JLPT N1',
        description: 'Advanced Japanese with native-level comprehension.',
        lessons: [
            { lessonNumber: 1, title: 'Lesson 1: Advanced Reading Comprehension' },
            { lessonNumber: 2, title: 'Lesson 2: Nuanced Vocabulary' },
            { lessonNumber: 3, title: 'Lesson 3: Hypothetical Discourse' },
            { lessonNumber: 4, title: 'Lesson 4: Expressing Contradiction' },
            { lessonNumber: 5, title: 'Lesson 5: Formal Speechcraft' },
            { lessonNumber: 6, title: 'Lesson 6: Academic Listening Practice' },
            { lessonNumber: 7, title: 'Lesson 7: Expressing Nuanced Emotions' },
            { lessonNumber: 8, title: 'Lesson 8: Review and Practice' }
        ]
    }
];

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

    const useMockData = new URLSearchParams(window.location.search).get('mock') === 'true';

    const manager = new CourseManager({
        ui,
        apiEndpoint: '/api/courses',
        sampleCourses: sampleCourseData.map(course => new Course(course)),
        useMockData
    });

    manager.init();
})();
