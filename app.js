const timerDisplay = document.querySelector("#timerDisplay");
const durationForm = document.querySelector("#durationForm");
const hoursInput = document.querySelector("#hrsInput");
const minutesInput = document.querySelector("#minutesInput");
const startButton = document.querySelector("#startButton");
const resumeButton = document.querySelector("#resumeButton");
const stopButton = document.querySelector("#stopButton");
const shortcutsButton = document.querySelector("#shortcutsButton");
const shortcutsDialog = document.querySelector("#shortcutsDialog");
const pauseHint = document.querySelector("#pauseHint");
const tags = document.querySelectorAll(".tag");
const tagOrder = Array.from(tags);
const hoursDisplay = document.querySelector("#hrs");
const minutesDisplay = document.querySelector("#mins");
const secondsDisplay = document.querySelector("#secs");
const endSound = new Audio("./assets/endSound.wav");

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
    shortcutsButton.hidden = isActive;
    resumeButton.hidden = !isPaused;
    stopButton.hidden = !isPaused;
    durationForm.hidden = true;
    // pauseHint.hidden = timerState !== "running";
    document.body.classList.toggle("session-running", isActive);
    document.body.classList.toggle("session-paused", isPaused);
}

function applyOrder() {
    tagOrder.forEach((tag, index) => {
        tag.dataset.pos = index;
    });
}

function selectTag(tag) {
    if (timerState !== "idle") {
        return;
    }

    const selectedIndex = tagOrder.findIndex((t) => t.classList.contains("selected"));
    const newIndex = tagOrder.indexOf(tag);
    if (selectedIndex !== newIndex) {
        [tagOrder[selectedIndex], tagOrder[newIndex]] = [tagOrder[newIndex], tagOrder[selectedIndex]];
    }

    applyOrder();
    tagOrder.forEach((t) => {
        t.classList.toggle("selected", t === tag);
        t.setAttribute("aria-pressed", String(t === tag));
    });
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
    document.title = "Focus - Session Ended";
    changeFavicon('./assets/focuslogo48.png');
    startButton.textContent = "Start Again";
    renderTime(remainingSeconds);
    renderControls();
    endSound.currentTime = 0;
    endSound.volume = 1.0;
    endSound.loop = true;
    endSound.play();
    pauseHint.textContent = "Click anywhere or press press 'space' to stop the sound";
    pauseHint.hidden = false;
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
    document.title = "Focus - Session Running";
    changeFavicon('./assets/focuslogo48green.png');
    pauseHint.hidden = false;
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
        pauseHint.hidden = true;
        document.title = "Focus - Session Paused";
        changeFavicon('./assets/focuslogo48yellow.png');
    }
}

function resumeTimer() {
    if (timerState !== "paused" || remainingSeconds <= 0) {
        return;
    }

    endTime = Date.now() + remainingSeconds * 1000;
    timerState = "running";
    renderControls();
    document.title = "Focus - Session Running";
    pauseHint.hidden = false;
    timerInterval = window.setInterval(updateTimer, 250);
    changeFavicon('./assets/focuslogo48green.png');
}

function stopSession() {
    stopInterval();
    remainingSeconds = configuredDuration;
    timerState = "idle";
    startButton.textContent = "Start Focus";
    renderTime(remainingSeconds);
    renderControls();
    document.title = "Focus";
    changeFavicon('./assets/focuslogo.svg');
}

function stopSound() {
    endSound.pause();
    endSound.currentTime = 0;
    pauseHint.hidden = true;
    pauseHint.textContent = "Click anywhere to pause";
}

function toggleShortcuts() {
    shortcutsDialog.classList.toggle("isOpen");
}

function openDurationForm() {
    if (timerState !== "idle") {
        return;
    }

    durationForm.hidden = false;
    hoursInput.focus();
    hoursInput.select();
}

function changeFavicon(iconUrl) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = iconUrl;
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

document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLElement
        && event.target.matches("input, textarea, select, button, [role='button'], [contenteditable='true']")) {
        return;
    }

    const key = event.key.toLowerCase();
    if (key === "/") {
        event.preventDefault();
        toggleShortcuts();
        return;
    }

    if (key === "t") {
        event.preventDefault();
        openDurationForm();
        return;
    }

    if (key === "q") {
        event.preventDefault();
        if (!endSound.paused) {
            stopSound();
        } else if (timerState !== "idle") {
            stopSession();
        }
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();
        if (!endSound.paused) {
            stopSound();
        } else if (timerState === "idle") {
            startTimer();
        } else if (timerState === "running") {
            pauseTimer();
        } else {
            resumeTimer();
        }
    }
});

startButton.addEventListener("click", startTimer);
resumeButton.addEventListener("click", resumeTimer);
stopButton.addEventListener("click", stopSession);

tags.forEach((tag) => {
    tag.setAttribute("aria-pressed", String(tag.classList.contains("selected")));
    tag.addEventListener("click", () => selectTag(tag));
    tag.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectTag(tag);
        }
    });
});

document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("button, input, form")) {
        return;
    }

    pauseTimer();
    if (!endSound.paused) {
        stopSound();
    }
});

shortcutsButton.addEventListener("click", () => {
    toggleShortcuts();
})

renderTime(remainingSeconds);
renderControls();
applyOrder();
