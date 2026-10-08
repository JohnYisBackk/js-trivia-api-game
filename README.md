# 🧠 Trivia API Game PRO

A modern and interactive trivia quiz application built with **HTML, CSS and Vanilla JavaScript**.

The application connects to the **Open Trivia Database API (OpenTDB)** and dynamically loads multiple-choice questions based on the selected category, difficulty, number of questions and time limit.

## 🚀 Live Demo

👉 [View Live Demo]()

## 📸 Preview

<p align="center">
  <img src="/preview.png" alt="Trivia API Game PRO Preview" width="900">  
</p>

## ✨ Features

- Dynamic trivia questions from the OpenTDB API
- Multiple quiz categories
- Easy, Medium and Hard difficulty levels
- Selectable number of questions
- Custom question time limit
- Real-time countdown timer
- Multiple-choice answer system
- Correct and incorrect answer highlighting
- Dynamic scoring system
- Difficulty-based points
- Streak bonus system
- Current streak tracking
- Total correct and wrong answer statistics
- Persistent total score with Local Storage
- 50/50 hint system
- Question progress indicator
- API connection status
- API response-time display
- Automatic handling of API rate limits
- Quiz completion screen
- Play Again functionality
- Dark / Light theme
- Theme preference stored in Local Storage
- Responsive layout
- Smooth navigation

## 🛠️ Built With

- HTML5
- CSS3
- JavaScript ES6+
- Fetch API
- Async / Await
- Open Trivia Database API
- Local Storage
- Bootstrap Icons

## ⚙️ How It Works

The application retrieves trivia questions from the Open Trivia Database API based on the current quiz settings.

The fetched answers are decoded, combined and randomly shuffled before being rendered into the interface.

Each question has its own countdown timer. After selecting an answer, the application:

- stops the timer
- checks the selected answer
- highlights the result
- updates the score
- updates the answer statistics
- updates the current streak
- enables the next question

Harder questions reward more points, while consecutive correct answers provide an additional streak bonus.

## 💡 Hint System

The player has access to a limited 50/50 hint.

When used, two incorrect answers are removed from the current question, leaving the correct answer and one incorrect option.

## 🌐 API

Questions are loaded from:

**Open Trivia Database (OpenTDB)**

The application also handles API request cooldowns to avoid unnecessary rate-limit errors when quiz settings are changed quickly.

## 💾 Local Storage

The application stores:

- Total correct answers
- Total wrong answers
- Total score
- Selected theme

This allows statistics and preferences to remain available after refreshing the page.

## 📁 Project Structure

```text
trivia-api-game-pro/
│
├── index.html
├── style.css
├── script.js
├── preview.png
├── README.md
└── LICENSE
```
