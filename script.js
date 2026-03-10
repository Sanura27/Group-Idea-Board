// GPA Calculator Logic
document.getElementById('add-course').addEventListener('click', () => {
    const courseList = document.getElementById('course-list');
    const newRow = document.createElement('div');
    newRow.className = 'course-row';
    newRow.innerHTML = `
        <input type="text" placeholder="e.g. Mathematics" class="course-name">
        <input type="number" placeholder="Credits" class="course-credits" min="0" step="0.5">
        <select class="course-grade">
            <option value="4.0">A (4.0)</option>
            <option value="3.7">A- (3.7)</option>
            <option value="3.3">B+ (3.3)</option>
            <option value="3.0">B (3.0)</option>
            <option value="2.7">B- (2.7)</option>
            <option value="2.3">C+ (2.3)</option>
            <option value="2.0">C (2.0)</option>
            <option value="1.7">C- (1.7)</option>
            <option value="1.0">D (1.0)</option>
            <option value="0.0">F (0.0)</option>
        </select>
        <button class="btn-remove" onclick="removeRow(this)">×</button>
    `;
    courseList.appendChild(newRow);
});

function removeRow(btn) {
    const rows = document.querySelectorAll('.course-row:not(.header)');
    if (rows.length > 1) {
        btn.parentElement.remove();
    } else {
        alert("At least one course is required.");
    }
}

document.getElementById('calculate-gpa').addEventListener('click', () => {
    const rows = document.querySelectorAll('.course-row:not(.header)');
    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
        const credits = parseFloat(row.querySelector('.course-credits').value);
        const grade = parseFloat(row.querySelector('.course-grade').value);

        if (!isNaN(credits) && credits > 0) {
            totalPoints += (credits * grade);
            totalCredits += credits;
        }
    });

    if (totalCredits > 0) {
        const gpa = (totalPoints / totalCredits).toFixed(2);
        document.getElementById('gpa-value').textContent = gpa;
    } else {
        alert("Please enter valid credits for your courses.");
    }
});

// Study Timer Logic
let timerInterval;
let secondsElapsed = 0;
let isRunning = false;

const minutesDisplay = document.getElementById('timer-minutes');
const secondsDisplay = document.getElementById('timer-seconds');
const startBtn = document.getElementById('timer-start');
const pauseBtn = document.getElementById('timer-pause');
const resetBtn = document.getElementById('timer-reset');

function updateDisplay() {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
}

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateDisplay();
        }, 1000);
    }
});

pauseBtn.addEventListener('click', () => {
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    clearInterval(timerInterval);
});

resetBtn.addEventListener('click', () => {
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = false;
    clearInterval(timerInterval);
    secondsElapsed = 0;
    updateDisplay();
});

// Initialize display
updateDisplay();
pauseBtn.disabled = true;
