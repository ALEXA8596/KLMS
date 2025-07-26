# KLMS
 
### Inspired By: 

- Khan Academy (learning through short texts), 
- Duolingo (languages and quiz format), 
- Canvas Instructure (modules and LMS), 
- Wikibooks & Wikipedia (Open Source Education), 
- Github (Open Source, Version History, "Diff"-ing)
- [Hobbscussion](https://github.com/TrollerZLabZ/Hobbscussion) (A previous hackathon project of mine that mimicked Discord, Reddit, Twitter)
- Udemy and Coursera (General Course System)


### Description

A platform where anyone can make their own lessons in order to teach others their knowledge. I originally wanted to create a blog-like website so I can teach myself and others how to speak languages like Korean and Japanese (The Duolingo Aspect). I've since decided to expand the text-based lesson system (derived from Canvas Instructure and Khan Academy) to include Flashcards and Quizzes, similar to that of Quizlet. Essentially, it's now an all encompassing LMS, similar to Google Classroom, Canvas Instructure, or Coursera.

### Features

- Text-based lessons to teach others about your desired topic.
- Quizzes based on your lessons to test one's knowledge after learning (react-quiz-component)
- Flashcards to help memorize ideas shared from the lessons
- Encrypted Passwords
- Version Control to bring back old versions of lessons, quizzes, and flashcards.
- API Key Integration, Allowing one to switch and choose which LLM to use to generate lesson, quiz, and flashcard content.

### Dependencies
- React
- Nextjs
- Next-Auth
- Bcrypt - For password encryption
- MongoDB - For storing user data, lessons, quizzes, and flashcards
- React-quiz-component - For the quiz management
- Diff - Version Control (Similar to Github)
- react-quizlet-flashcard - For flashcard presentation
- @themaximalist/llm.js - For LLM interactions
- Bootstrap - For visuals & css