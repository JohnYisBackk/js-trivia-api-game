"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

// Header & Navigation
const navLinks = document.querySelectorAll(".nav-link");

const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = document.querySelector(".toggle-button > i");
const toggleSwitch = document.querySelector(".toggle-switch");

// Page Sections
const gameStatsSection = document.querySelector(".game-stats-section");
const quizSettingsSection = document.querySelector(".quiz-settings-section");
const apiStatusSection = document.querySelector(".api-status-section");
const mainTriviaSection = document.querySelector(".main-trivia-section");
const footer = document.querySelector(".footer");

// Game Stats
const correctAnswersValue = document.getElementById("correctAnswersValue");
const wrongAnswersValue = document.getElementById("wrongAnswersValue");
const currentStreakValue = document.getElementById("currentStreakValue");
const totalScoreValue = document.getElementById("totalScoreValue");

// Quiz Settings
const quizForm = document.querySelector(".quiz-form");

const difficultySelect = document.getElementById("difficultySelect");
const categorySelect = document.getElementById("categorySelect");
const questionsSelect = document.getElementById("questionsSelect");
const timeLimitSelect = document.getElementById("timeLimitSelect");

// API Status
const apiStatusBadge = document.querySelector(".api-status-badge");
const apiStatusText = document.querySelector(".api-status-badge span");
const apiStatusDot = document.querySelector(".dot");

const apiConnectionBox = document.querySelector(".api-connection-box");

const apiConnectionText = document.querySelector(
  ".api-connection-content span",
);

const apiConnectionIcon = document.querySelector(".api-circle-icon");

const responseTimeValue = document.getElementById("responseTimeValue");
const questionsValue = document.getElementById("questionsValue");
const uptimeValue = document.getElementById("uptimeValue");

// Question Progress
const questionProgressText = document.getElementById("questionProgressText");
const questionsLineFill = document.getElementById("questionsLineFill");
const questionsLineValue = document.getElementById("questionsLineValue");

// Current Quiz Stats
const categoryValue = document.getElementById("categoryValue");
const difficultyValue = document.getElementById("difficultyValue");
const timeLeftValue = document.getElementById("timeLeftValue");
const scoreValue = document.getElementById("scoreValue");

// Question
const questionBox = document.getElementById("questionBox");
const questionText = document.querySelector("#questionBox p");

// Answers
const answersBoxes = document.getElementById("answersBoxes");
const answerButtons = document.querySelectorAll(".answer-box");
const answerTexts = document.querySelectorAll(".answer-text");

// Quiz Actions
const hintBtn = document.getElementById("hintBtn");
const hintValue = document.getElementById("hintValue");

const nextQuestionBtn = document.getElementById("nextQuestionBtn");

// ======================================================
// STATE
// ======================================================

let questions = [];
let currentQuestionIndex = 0;

let question = "";
let answers = [];
let correctAnswer = "";

let category = "General Knowledge";
let difficulty = "Medium";

let timeLeft = 30;
let timer = null;

let score = 0;
let totalScore = 0;

let correctAnswers = 0;
let wrongAnswers = 0;
let currentStreak = 0;

let hintsLeft = 1;
let usedHint = false;

let currentTheme = "dark";

let quizCompleted = false;

let settingsRestartTimeout = null;

const API_COOLDOWN = 5200;

let lastApiRequestTime = 0;

// ======================================================
// THEME
// ======================================================

function loadTheme() {
  const storedTheme = localStorage.getItem("triviaGameTheme");

  if (storedTheme) {
    currentTheme = storedTheme;
  }

  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;

  toggleIcon.className =
    currentTheme === "dark" ? "bi bi-moon-fill" : "bi bi-sun-fill";
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme();

  localStorage.setItem("triviaGameTheme", currentTheme);
}

// ======================================================
// NAVIGATION
// ======================================================

function scrollToSection(section) {
  const headerOffset = 100;

  const sectionPosition =
    section.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: sectionPosition,
    behavior: "smooth",
  });
}

function handleNavigation(link) {
  navLinks.forEach((navLink) => {
    navLink.classList.remove("active");
  });

  link.classList.add("active");

  const selectedLink = link.dataset.link;

  if (selectedLink === "home") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (selectedLink === "quiz") {
    scrollToSection(mainTriviaSection);
  }

  if (selectedLink === "stats") {
    scrollToSection(gameStatsSection);
  }

  if (selectedLink === "about") {
    scrollToSection(footer);
  }
}

// ======================================================
// API STATUS
// ======================================================

function updateApiStatus(isOnline, responseTime = 0) {
  if (isOnline) {
    apiStatusText.textContent = "Online";

    apiConnectionText.textContent = "Successfully connected to OpenTDB API";

    responseTimeValue.textContent = `${responseTime} ms`;

    apiConnectionIcon.className = "bi bi-check-circle-fill api-circle-icon";

    apiStatusBadge.classList.remove("offline");
    apiStatusBadge.classList.add("online");

    return;
  }

  apiStatusText.textContent = "Offline";

  apiConnectionText.textContent = "Unable to connect to OpenTDB API";

  responseTimeValue.textContent = "--";

  apiConnectionIcon.className = "bi bi-x-circle-fill api-circle-icon";

  apiStatusBadge.classList.remove("online");
  apiStatusBadge.classList.add("offline");
}

function setApiLoadingStatus(message = "Loading questions...") {
  apiStatusText.textContent = "Loading...";

  apiConnectionText.textContent = message;

  responseTimeValue.textContent = "--";

  apiStatusBadge.classList.remove("online", "offline");
}

// ======================================================
// API COOLDOWN
// ======================================================

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForApiCooldown() {
  const elapsedTime = Date.now() - lastApiRequestTime;

  const remainingTime = API_COOLDOWN - elapsedTime;

  if (remainingTime > 0) {
    await wait(remainingTime);
  }

  lastApiRequestTime = Date.now();
}

// ======================================================
// FETCH QUESTIONS
// ======================================================

async function requestTriviaQuestions(url) {
  await waitForApiCooldown();

  const startTime = performance.now();

  const response = await fetch(url);

  const data = await response.json();

  const responseTime = Math.round(performance.now() - startTime);

  return {
    response,
    data,
    responseTime,
  };
}

async function fetchQuestions(settings) {
  const url =
    `https://opentdb.com/api.php?amount=${settings.amount}` +
    `&category=${settings.categoryId}` +
    `&difficulty=${settings.difficulty}` +
    `&type=multiple`;

  try {
    setApiLoadingStatus();

    let result = await requestTriviaQuestions(url);

    if (!result.response.ok) {
      throw new Error("Failed to fetch questions");
    }

    if (result.data.response_code === 5) {
      setApiLoadingStatus("API rate limit reached. Retrying...");

      result = await requestTriviaQuestions(url);
    }

    if (result.data.response_code === 1) {
      updateApiStatus(true, result.responseTime);

      apiConnectionText.textContent =
        "API is online, but there are not enough questions for these settings.";

      return [];
    }

    if (result.data.response_code !== 0) {
      throw new Error(`OpenTDB response code: ${result.data.response_code}`);
    }

    updateApiStatus(true, result.responseTime);

    return result.data.results;
  } catch (error) {
    updateApiStatus(false);

    console.error("Fetch Questions Error:", error);

    return [];
  }
}

// ======================================================
// START QUIZ
// ======================================================

async function startQuiz() {
  clearTimeout(settingsRestartTimeout);

  if (timer) {
    clearInterval(timer);

    timer = null;
  }

  quizCompleted = false;

  nextQuestionBtn.innerHTML = `Next Question <i class="bi bi-arrow-right"></i>`;

  nextQuestionBtn.disabled = true;
  hintBtn.disabled = true;

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  questionText.textContent = "Loading questions...";

  const settings = {
    amount: questionsSelect.value,

    categoryId: categorySelect.value,

    categoryName: categorySelect.options[categorySelect.selectedIndex].text,

    difficulty: difficultySelect.value,

    difficultyName:
      difficultySelect.options[difficultySelect.selectedIndex].text,

    timeLimit: Number(timeLimitSelect.value),
  };

  const fetchedQuestions = await fetchQuestions(settings);

  if (fetchedQuestions.length === 0) {
    questionText.textContent = "No questions available for these settings.";

    nextQuestionBtn.disabled = true;
    hintBtn.disabled = true;

    return;
  }

  questions = fetchedQuestions;

  currentQuestionIndex = 0;

  score = 0;
  currentStreak = 0;

  hintsLeft = 1;
  usedHint = false;

  category = settings.categoryName;
  difficulty = settings.difficultyName;

  timeLeft = settings.timeLimit;

  categoryValue.textContent = category;
  difficultyValue.textContent = difficulty;

  scoreValue.textContent = `${score} pts`;

  hintValue.textContent = `(${hintsLeft})`;

  timeLeftValue.textContent = `00:${String(timeLeft).padStart(2, "0")}`;

  updateStats();

  renderQuestion();
  updateQuestionProgress();
  startTimer();
}

// ======================================================
// RESTART QUIZ AFTER SETTINGS CHANGE
// ======================================================

function scheduleQuizRestart() {
  clearTimeout(settingsRestartTimeout);

  if (timer) {
    clearInterval(timer);

    timer = null;
  }

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  hintBtn.disabled = true;
  nextQuestionBtn.disabled = true;

  questionText.textContent = "Loading new quiz...";

  setApiLoadingStatus("Waiting for OpenTDB API...");

  const elapsedTime = Date.now() - lastApiRequestTime;

  const remainingCooldown = Math.max(0, API_COOLDOWN - elapsedTime);

  const restartDelay = Math.max(400, remainingCooldown + 100);

  settingsRestartTimeout = setTimeout(() => {
    startQuiz();
  }, restartDelay);
}

// ======================================================
// SHUFFLE ANSWERS
// ======================================================

function shuffleAnswers(answersArray) {
  const shuffledAnswers = [...answersArray];

  for (let i = shuffledAnswers.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledAnswers[i], shuffledAnswers[randomIndex]] = [
      shuffledAnswers[randomIndex],
      shuffledAnswers[i],
    ];
  }

  return shuffledAnswers;
}

// ======================================================
// RENDER QUESTION
// ======================================================

function decodeHtml(text) {
  const textarea = document.createElement("textarea");

  textarea.innerHTML = text;

  return textarea.value;
}

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) return;

  question = decodeHtml(currentQuestion.question);

  correctAnswer = decodeHtml(currentQuestion.correct_answer);

  const incorrectAnswers = currentQuestion.incorrect_answers.map((answer) =>
    decodeHtml(answer),
  );

  answers = shuffleAnswers([...incorrectAnswers, correctAnswer]);

  category = decodeHtml(currentQuestion.category);

  difficulty =
    currentQuestion.difficulty.charAt(0).toUpperCase() +
    currentQuestion.difficulty.slice(1);

  questionText.textContent = question;

  categoryValue.textContent = category;
  difficultyValue.textContent = difficulty;

  answerButtons.forEach((button, index) => {
    const answerText = button.querySelector(".answer-text");

    answerText.textContent = answers[index];

    button.dataset.answer = answers[index];

    button.classList.remove("correct", "wrong", "hint-hidden");

    button.style.display = "";

    button.disabled = false;
  });

  usedHint = false;

  hintValue.textContent = `(${hintsLeft})`;

  hintBtn.disabled = hintsLeft <= 0;

  timeLeft = Number(timeLimitSelect.value);

  timeLeftValue.textContent = `00:${String(timeLeft).padStart(2, "0")}`;

  nextQuestionBtn.disabled = true;
}

// ======================================================
// START TIMER
// ======================================================

function startTimer() {
  if (timer) {
    clearInterval(timer);
  }

  timeLeftValue.textContent = `00:${String(timeLeft).padStart(2, "0")}`;

  timer = setInterval(() => {
    timeLeft--;

    timeLeftValue.textContent = `00:${String(timeLeft).padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timer);

      timer = null;
      timeLeft = 0;

      timeLeftValue.textContent = "00:00";

      wrongAnswers++;
      currentStreak = 0;

      answerButtons.forEach((button) => {
        button.disabled = true;

        if (button.dataset.answer === correctAnswer) {
          button.classList.add("correct");
        }
      });

      hintBtn.disabled = true;
      nextQuestionBtn.disabled = false;

      updateStats();
      saveStats();
    }
  }, 1000);
}

// ======================================================
// HANDLE ANSWER
// ======================================================

function handleAnswer(clickedButton) {
  clearInterval(timer);

  timer = null;

  const selectedAnswer = clickedButton.dataset.answer;

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  hintBtn.disabled = true;

  if (selectedAnswer === correctAnswer) {
    clickedButton.classList.add("correct");

    correctAnswers++;
    currentStreak++;

    let points = 0;

    if (difficulty === "Easy") {
      points = 10;
    }

    if (difficulty === "Medium") {
      points = 20;
    }

    if (difficulty === "Hard") {
      points = 30;
    }

    const streakBonus = (currentStreak - 1) * 5;

    const earnedPoints = points + streakBonus;

    score += earnedPoints;
    totalScore += earnedPoints;
  } else {
    clickedButton.classList.add("wrong");

    wrongAnswers++;
    currentStreak = 0;

    answerButtons.forEach((button) => {
      if (button.dataset.answer === correctAnswer) {
        button.classList.add("correct");
      }
    });
  }

  nextQuestionBtn.disabled = false;

  updateStats();
  saveStats();
}

// ======================================================
// USE HINT
// ======================================================

function useHint() {
  if (usedHint || hintsLeft <= 0) {
    return;
  }

  const wrongButtons = [...answerButtons].filter((button) => {
    return button.dataset.answer !== correctAnswer && !button.disabled;
  });

  const shuffledWrongButtons = shuffleAnswers(wrongButtons);

  shuffledWrongButtons.slice(0, 2).forEach((button) => {
    button.disabled = true;

    button.classList.add("hint-hidden");

    button.style.display = "none";
  });

  hintsLeft--;

  usedHint = true;

  hintValue.textContent = `(${hintsLeft})`;

  hintBtn.disabled = true;
}

// ======================================================
// NEXT QUESTION
// ======================================================

function nextQuestion() {
  if (quizCompleted) {
    startQuiz();

    return;
  }

  clearInterval(timer);

  timer = null;

  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    completeQuiz();

    return;
  }

  renderQuestion();
  updateQuestionProgress();
  startTimer();
}

// ======================================================
// UPDATE QUESTION PROGRESS
// ======================================================

function updateQuestionProgress() {
  if (questions.length === 0) {
    return;
  }

  const currentQuestionNumber = currentQuestionIndex + 1;

  const progressPercent = Math.round(
    (currentQuestionNumber / questions.length) * 100,
  );

  questionProgressText.textContent = `Question ${currentQuestionNumber} of ${questions.length}`;

  questionsLineFill.style.width = `${progressPercent}%`;

  questionsLineValue.textContent = `${progressPercent}%`;
}

// ======================================================
// UPDATE GAME STATS
// ======================================================

function updateStats() {
  correctAnswersValue.textContent = correctAnswers;

  wrongAnswersValue.textContent = wrongAnswers;

  currentStreakValue.textContent = currentStreak;

  scoreValue.textContent = `${score} pts`;

  totalScoreValue.textContent = totalScore;
}

// ======================================================
// SAVE / LOAD GAME STATS
// ======================================================

function saveStats() {
  const gameStats = {
    correctAnswers,
    wrongAnswers,
    totalScore,
  };

  localStorage.setItem("triviaGameStats", JSON.stringify(gameStats));
}

function loadStats() {
  const storedStats = localStorage.getItem("triviaGameStats");

  if (!storedStats) return;

  const gameStats = JSON.parse(storedStats);

  correctAnswers = gameStats.correctAnswers ?? 0;

  wrongAnswers = gameStats.wrongAnswers ?? 0;

  totalScore = gameStats.totalScore ?? 0;

  updateStats();
}

// ======================================================
// COMPLETE QUIZ
// ======================================================

function completeQuiz() {
  clearInterval(timer);

  timer = null;

  timeLeft = 0;

  quizCompleted = true;

  timeLeftValue.textContent = "00:00";

  questionProgressText.textContent = `Completed ${questions.length} of ${questions.length}`;

  questionsLineFill.style.width = "100%";

  questionsLineValue.textContent = "100%";

  questionText.textContent = `Quiz completed! You scored ${score} points.`;

  answerButtons.forEach((button) => {
    button.disabled = true;

    button.style.display = "";

    button.classList.remove("correct", "wrong", "hint-hidden");
  });

  hintBtn.disabled = true;

  nextQuestionBtn.disabled = false;

  nextQuestionBtn.innerHTML = `Play Again <i class="bi bi-arrow-clockwise"></i>`;

  updateStats();
  saveStats();
}

// ======================================================
// EVENT LISTENERS
// ======================================================

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    handleNavigation(link);
  });
});

toggleBtn.addEventListener("click", toggleTheme);

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleAnswer(button);
  });
});

hintBtn.addEventListener("click", useHint);

nextQuestionBtn.addEventListener("click", nextQuestion);

difficultySelect.addEventListener("change", scheduleQuizRestart);

categorySelect.addEventListener("change", scheduleQuizRestart);

questionsSelect.addEventListener("change", scheduleQuizRestart);

timeLimitSelect.addEventListener("change", scheduleQuizRestart);

// ======================================================
// INITIALIZE APP
// ======================================================

async function initApp() {
  loadTheme();
  loadStats();

  await startQuiz();
}

initApp();
