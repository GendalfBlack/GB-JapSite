-- Schema and seed data for JLPT courses and lessons
-- Run this file against the configured database to provision
-- course and lesson data used by the management dashboard.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    lesson_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_course_lesson UNIQUE (course_id, lesson_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO courses (level_code, name, description, display_order) VALUES
    ('N5', 'JLPT N5', 'Foundational Japanese for absolute beginners.', 1),
    ('N4', 'JLPT N4', 'Lower-intermediate Japanese grammar and vocabulary.', 2),
    ('N3', 'JLPT N3', 'Bridge level with intermediate grammar patterns.', 3),
    ('N2', 'JLPT N2', 'Upper-intermediate Japanese for academic and professional contexts.', 4),
    ('N1', 'JLPT N1', 'Advanced Japanese with native-level comprehension.', 5)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    display_order = VALUES(display_order);

DELETE FROM lessons;

INSERT INTO lessons (course_id, lesson_number, title, summary, is_published) VALUES
    ((SELECT id FROM courses WHERE level_code = 'N5'), 1, 'Lesson 1: Hiragana Basics', 'Master the first set of Japanese phonetic characters.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 2, 'Lesson 2: Greetings and Introductions', 'Learn essential phrases for meeting new people.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 3, 'Lesson 3: Daily Activities Vocabulary', 'Talk about your daily routine using simple verbs.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 4, 'Lesson 4: Numbers and Counters', 'Count objects, people, and money with confidence.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 5, 'Lesson 5: Basic Sentence Structure', 'Combine nouns, particles, and verbs into sentences.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 6, 'Lesson 6: Family and Relationships', 'Introduce your family members and describe relationships.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 7, 'Lesson 7: Time Expressions', 'Explain the time and talk about schedules.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 8, 'Lesson 8: Adjectives and Descriptions', 'Use i-adjectives and na-adjectives to describe objects.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 9, 'Lesson 9: Asking Questions', 'Form polite questions with ka and interrogative words.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 10, 'Lesson 10: Shopping Phrases', 'Buy items and ask for prices in stores.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 11, 'Lesson 11: Verb Te-form Basics', 'Connect verbs and make simple requests with te-form.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 12, 'Lesson 12: Locations and Directions', 'Give and follow basic directions.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 13, 'Lesson 13: Particles Review', 'Reinforce particle usage with practical exercises.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 14, 'Lesson 14: Likes and Dislikes', 'Express preferences using suki and kirai.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 15, 'Lesson 15: Weather and Seasons', 'Discuss weather conditions and seasonal activities.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 16, 'Lesson 16: Verb Past Tense', 'Talk about past events using ta-form.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 17, 'Lesson 17: Invitations and Plans', 'Make plans and invite friends politely.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 18, 'Lesson 18: Transportation Vocabulary', 'Navigate trains, buses, and taxis in Japanese.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 19, 'Lesson 19: Restaurant Conversations', 'Order food and drinks at Japanese eateries.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 20, 'Lesson 20: Giving Reasons with kara', 'Explain why something happens using kara.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 21, 'Lesson 21: Verb Potential Form', 'Talk about what you can and cannot do.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 22, 'Lesson 22: Invitations with mashou', 'Suggest plans using mashou and volitional forms.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 23, 'Lesson 23: Requests with kudasai', 'Ask for help politely in different situations.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 24, 'Lesson 24: Comparisons with yori', 'Compare objects and preferences.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N5'), 25, 'Lesson 25: Review and Practice', 'Wrap up N5 concepts with integrated practice.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 1, 'Lesson 1: Keigo Essentials', 'Introductory honorific and humble forms for politeness.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 2, 'Lesson 2: Complex Sentence Patterns', 'Combine clauses with ga, keredo, and noni.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 3, 'Lesson 3: Verb Te-iru Nuances', 'Express ongoing actions and resultant states.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 4, 'Lesson 4: Expressing Obligation', 'Use nakereba naranai and to ikemasen structures.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 5, 'Lesson 5: Expressing Ability and Permission', 'Review potential forms and practice temo ii desu.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 6, 'Lesson 6: Wishes and Intentions', 'Learn tai, hoshii, and volitional expressions.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 7, 'Lesson 7: Giving and Receiving Verbs', 'Master ageru, kureru, and morau usage.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 8, 'Lesson 8: Expressing Experience', 'Use koto ga aru to talk about past experiences.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 9, 'Lesson 9: Conditional Forms', 'Practice tara, to, ba, and nara conditionals.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 10, 'Lesson 10: Casual Speech Patterns', 'Switch between polite and plain forms naturally.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 11, 'Lesson 11: Expressing Purpose', 'Use tame ni and you ni for goals and purposes.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 12, 'Lesson 12: Transitive vs. Intransitive Verbs', 'Differentiate verb pairs in daily contexts.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 13, 'Lesson 13: Describing Preparations', 'Use teoku and teoku ita to talk about prep work.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 14, 'Lesson 14: Expressing Hearsay', 'Practice sou da and rashii for reported speech.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 15, 'Lesson 15: Expressing Attempts', 'Use you to suru and te miru structures.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 16, 'Lesson 16: Passive Voice Introduction', 'Create sentences using passive verb forms.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 17, 'Lesson 17: Causative Basics', 'Make someone do something with saseru forms.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 18, 'Lesson 18: Expressing Excess', 'Use sugiru and gatai to describe extremes.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 19, 'Lesson 19: Expressing While Doing', 'Combine verbs with nagara for simultaneous actions.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N4'), 20, 'Lesson 20: Review and Practice', 'Consolidate N4 grammar with dialogues.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 1, 'Lesson 1: Nuanced Particles', 'Deepen understanding of particles such as wa vs. mo.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 2, 'Lesson 2: Advanced Te-form Uses', 'Explore te-form idioms and advanced linking.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 3, 'Lesson 3: Expressing Concessions', 'Learn temoii, temo, and noni variations.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 4, 'Lesson 4: Emphasis Structures', 'Use wake, hazu, and teki for nuance.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 5, 'Lesson 5: Expressing Probability', 'Practice darou, kamo shirenai, and ni chigainai.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 6, 'Lesson 6: Passive Causative Review', 'Combine passive and causative verb forms.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 7, 'Lesson 7: Formal Expressions', 'Use keigo in business scenarios.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 8, 'Lesson 8: Relative Clauses', 'Build complex noun-modifying clauses.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 9, 'Lesson 9: Expressing Intentions', 'Use tsumori, yotei, and ni shite wa.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 10, 'Lesson 10: Idiomatic Expressions', 'Learn natural phrases for everyday speech.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 11, 'Lesson 11: Written Japanese Styles', 'Understand formal structures found in print.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 12, 'Lesson 12: Expressing Gradual Change', 'Practice you ni naru and tsutsu aru patterns.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 13, 'Lesson 13: Hypothetical Expressions', 'Use toshitara and to sureba for hypotheticals.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 14, 'Lesson 14: Expressing Emotions', 'Convey feelings with bakari and kurai.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N3'), 15, 'Lesson 15: Review and Practice', 'Integrate N3 grammar with reading drills.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 1, 'Lesson 1: Academic Reading Strategies', 'Approach long-form passages efficiently.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 2, 'Lesson 2: Nuanced Conditionals', 'Contrast toshite mo, temo, and ba forms.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 3, 'Lesson 3: Formal Written Expressions', 'Study expressions common in reports and essays.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 4, 'Lesson 4: Advanced Honorifics', 'Refine sonkeigo and kenjougo in context.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 5, 'Lesson 5: Expressing Criticism', 'Use toshite and te wa naranai to critique.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 6, 'Lesson 6: Emphatic Structures', 'Study hazu ga nai, wake ni wa ikanai, and more.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 7, 'Lesson 7: Academic Vocabulary', 'Develop reading proficiency with N2 kanji.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 8, 'Lesson 8: Expressing Simultaneity', 'Use ippou, tsutsu, and kagiri.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 9, 'Lesson 9: Persuasive Writing', 'Craft opinions using koto ni naru and mono da.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N2'), 10, 'Lesson 10: Review and Practice', 'Synthesize N2 grammar with essays.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 1, 'Lesson 1: Advanced Reading Comprehension', 'Interpret scholarly Japanese texts.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 2, 'Lesson 2: Nuanced Vocabulary', 'Study idioms and rare expressions.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 3, 'Lesson 3: Hypothetical Discourse', 'Use toshita tokoro de and tomo for speculation.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 4, 'Lesson 4: Expressing Contradiction', 'Master kadokoro ka, monononagara, and more.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 5, 'Lesson 5: Formal Speechcraft', 'Deliver polished speeches and presentations.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 6, 'Lesson 6: Academic Listening Practice', 'Decipher lectures and debates.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 7, 'Lesson 7: Expressing Nuanced Emotions', 'Use bakarika, node wa nai, and saredo.', 1),
    ((SELECT id FROM courses WHERE level_code = 'N1'), 8, 'Lesson 8: Review and Practice', 'Bring together advanced patterns with case studies.', 1);

