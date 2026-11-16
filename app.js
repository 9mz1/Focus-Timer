const timerDisplay = document.querySelector("#timerDisplay");
const durationForm = document.querySelector("#durationForm");
const hoursInput = document.querySelector("#hrsInput");
const minutesInput = document.querySelector("#minutesInput");
const startButton = document.querySelector("#startButton");
const resumeButton = document.querySelector("#resumeButton");
const stopButton = document.querySelector("#stopButton");
const pauseHint = document.querySelector("#pauseHint");
const hoursDisplay = document.querySelector("#hrs");
const minutesDisplay = document.querySelector("#mins");
const secondsDisplay = document.querySelector("#secs");

const defaultDuration = 25 * 60;
let configuredDuration = defaultDuration;
let remainingSeconds = defaultDuration;
let endTime = 0;
let timerInterval = null;
let timerState = "idle";

function formatTime(value) {
    return String(value).padStart(2, "0");
}

function renderTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursDisplay.textContent = formatTime(hours);
    minutesDisplay.textContent = formatTime(minutes);
    secondsDisplay.textContent = formatTime(seconds);
}

function renderControls() {
    const isPaused = timerState === "paused";
    const isActive = timerState === "running" || isPaused;

    startButton.hidden = isActive;
    resumeButton.hidden = !isPaused;
    stopButton.hidden = !isPaused;
    durationForm.hidden = true;
    pauseHint.hidden = timerState !== "running";
    document.body.classList.toggle("session-running", isActive);
}

function stopInterval() {   
    if (timerInterval !== null) {
        window.clearInterval(timerInterval);
        timerInterval = null;
    }
}

function finishSession() {
    stopInterval();
    remainingSeconds = 0;
    timerState = "idle";
    startButton.textContent = "Start Again";
    renderTime(remainingSeconds);
    renderControls();

}

function updateTimer() {
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    renderTime(remainingSeconds);

    if (remainingSeconds === 0) {
        finishSession();
    }
}

function startTimer() {
    if (configuredDuration <= 0) {
        return;
    }

    remainingSeconds = configuredDuration;
    endTime = Date.now() + remainingSeconds * 1000;
    timerState = "running";
    startButton.textContent = "Start Focus";
    renderControls();
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 250);
}

function pauseTimer() {
    if (timerState !== "running") {
        return;
    }

    updateTimer();
    if (timerState === "running") {
        stopInterval();
        timerState = "paused";
        renderControls();
    }
}

function resumeTimer() {
    if (timerState !== "paused" || remainingSeconds <= 0) {
        return;
    }

    endTime = Date.now() + remainingSeconds * 1000;
    timerState = "running";
    renderControls();
    timerInterval = window.setInterval(updateTimer, 250);
}

function stopSession() {
    stopInterval();
    remainingSeconds = configuredDuration;
    timerState = "idle";
    startButton.textContent = "Start Focus";
    renderTime(remainingSeconds);
    renderControls();
}

timerDisplay.addEventListener("click", () => {
    if (timerState !== "idle") {
        return;
    }

    durationForm.hidden = !durationForm.hidden;
    if (!durationForm.hidden) {
        hoursInput.focus();
        hoursInput.select();
    }
});

timerDisplay.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && timerState === "idle") {
        event.preventDefault();
        timerDisplay.click();
    }
});

durationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const hours = Number.parseInt(hoursInput.value, 10);
    const minutes = Number.parseInt(minutesInput.value, 10);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)
        || hours < 0 || hours > 99 || minutes < 0 || minutes > 59
        || hours * 60 + minutes <= 0) {
        durationForm.reportValidity();
        return;
    }

    configuredDuration = hours * 3600 + minutes * 60;
    remainingSeconds = configuredDuration;
    renderTime(remainingSeconds);
    renderControls();
});

startButton.addEventListener("click", startTimer);
resumeButton.addEventListener("click", resumeTimer);
stopButton.addEventListener("click", stopSession);

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && event.target instanceof HTMLElement
        && !event.target.matches("input, button")) {
        event.preventDefault();
        pauseTimer();
    }
});

document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("button, input, form")) {
        return;
    }

    pauseTimer();
});

renderTime(remainingSeconds);
renderControls();