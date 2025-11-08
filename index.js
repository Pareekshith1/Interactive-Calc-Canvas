// ===========================
// CALCULATOR FUNCTIONALITY
// ===========================

const numberDisplay = document.getElementById("number");
let currentInput = "0";
let previousInput = "";
let operator = "";
let history = [];

// Update display
function updateDisplay() {
    numberDisplay.textContent = currentInput;
}

// Handle number and decimal clicks
document.querySelectorAll('.mainnum').forEach(button => {
    button.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        
        if (value === '.' && currentInput.includes('.')) return;
        
        if (currentInput === "0" && value !== '.') {
            currentInput = value;
        } else {
            currentInput += value;
        }
        updateDisplay();
    });
});

// Handle operator clicks
document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', function() {
        if (currentInput === "") return;
        
        if (previousInput !== "" && operator !== "") {
            calculate();
        }
        
        operator = this.getAttribute('data-value');
        previousInput = currentInput;
        currentInput = "";
    });
});

// Handle equals click
document.getElementById('equals').addEventListener('click', calculate);

function calculate() {
    if (currentInput === "" || previousInput === "" || operator === "") return;
    
    const num1 = parseFloat(previousInput);
    const num2 = parseFloat(currentInput);
    let result;
    
    switch (operator) {
        case "+":
            result = num1 + num2;
            break;
        case "-":
            result = num1 - num2;
            break;
        case "*":
            result = num1 * num2;
            break;
        case "/":
            if (num2 === 0) {
                alert("Cannot divide by zero!");
                clear_screen();
                return;
            }
            result = num1 / num2;
            break;
        default:
            return;
    }
    
    // Add to history
    const calculation = `${previousInput} ${operator} ${currentInput} = ${result}`;
    history.push(calculation);
    saveHistory();
    
    currentInput = result.toString();
    previousInput = "";
    operator = "";
    updateDisplay();
}

// Clear screen
document.getElementById('clear').addEventListener('click', clear_screen);

function clear_screen() {
    currentInput = "0";
    previousInput = "";
    operator = "";
    updateDisplay();
}

// Backspace
document.getElementById('backspace').addEventListener('click', function() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = "0";
    }
    updateDisplay();
});

// Keyboard support for calculator
document.addEventListener('keydown', function(e) {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        const btn = Array.from(document.querySelectorAll('.mainnum')).find(b => b.getAttribute('data-value') === e.key);
        if (btn) btn.click();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const btn = Array.from(document.querySelectorAll('.operator')).find(b => b.getAttribute('data-value') === e.key);
        if (btn) btn.click();
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        document.getElementById('equals').click();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clear_screen();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        document.getElementById('backspace').click();
    }
});

// ===========================
// DRAG AND DROP CALCULATOR
// ===========================

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const calculator = document.getElementById("main-div");
const dragHandle = document.getElementById("calc-header");

dragHandle.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);

// Touch events for mobile
dragHandle.addEventListener("touchstart", dragStart);
document.addEventListener("touchmove", drag);
document.addEventListener("touchend", dragEnd);

function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target === dragHandle || dragHandle.contains(e.target)) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, calculator);
    }
}

function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// ===========================
// WHITEBOARD FUNCTIONALITY
// ===========================

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const penColor = document.getElementById('pen-color');
const penSize = document.getElementById('pen-size');
const clearBtn = document.getElementById('clear-canvas');
const eraserBtn = document.getElementById('eraser-btn');
const textModeBtn = document.getElementById('text-mode-btn');

let isDrawing = false;
let isEraser = false;
let isTextMode = false;
let lastX = 0;
let lastY = 0;

// Drawing functions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch support for whiteboard
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchDraw);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    if (isTextMode) return;
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing || isTextMode) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = isEraser ? '#ffffff' : penColor.value;
    ctx.lineWidth = penSize.value;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    if (isTextMode) return;
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
}

function handleTouchDraw(e) {
    if (!isDrawing || isTextMode) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = isEraser ? '#ffffff' : penColor.value;
    ctx.lineWidth = penSize.value;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

// Clear canvas
clearBtn.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Eraser mode
eraserBtn.addEventListener('click', function() {
    isEraser = !isEraser;
    isTextMode = false;
    eraserBtn.style.backgroundColor = isEraser ? '#667eea' : '#444';
    textModeBtn.style.backgroundColor = '#444';
    canvas.style.cursor = isEraser ? 'not-allowed' : 'crosshair';
});

// Text mode
let textInput = '';
textModeBtn.addEventListener('click', function() {
    isTextMode = !isTextMode;
    isEraser = false;
    textModeBtn.style.backgroundColor = isTextMode ? '#667eea' : '#444';
    eraserBtn.style.backgroundColor = '#444';
    canvas.style.cursor = isTextMode ? 'text' : 'crosshair';
});

// Text mode click handler
canvas.addEventListener('click', function(e) {
    if (!isTextMode) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const text = prompt('Enter text:');
    if (text) {
        ctx.font = `${penSize.value * 5}px Arial`;
        ctx.fillStyle = penColor.value;
        ctx.fillText(text, x, y);
    }
});

// Keyboard input for text mode (when canvas is active)
document.addEventListener('keydown', function(e) {
    // Prevent calculator keyboard shortcuts when typing on whiteboard
    if (document.activeElement === canvas && isTextMode) {
        e.stopPropagation();
    }
});

// ===========================
// THEME TOGGLE
// ===========================

let themeMode = 0;
const sliderButton = document.getElementById("slider-button");
const sliderBackground = document.getElementById("slider");
const body = document.getElementById("bod");
const icons = document.querySelectorAll(".bar");

function mover() {
    if (themeMode === 0) {
        sliderButton.style.left = "65px";
        sliderBackground.style.backgroundColor = "#333";
        sliderButton.style.backgroundColor = "#FFFFF0";
        body.style.backgroundColor = "white";
        
        icons.forEach(function(icon) {
            icon.style.backgroundColor = "#333";
        });
        
        themeMode = 1;
    } else {
        sliderButton.style.left = "5px";
        sliderBackground.style.backgroundColor = "white";
        sliderButton.style.backgroundColor = "black";
        body.style.backgroundColor = "#333";
        
        icons.forEach(function(icon) {
            icon.style.backgroundColor = "white";
        });
        
        themeMode = 0;
    }
}

// ===========================
// MENU BAR
// ===========================

let menuOpen = false;
function hideandseek_menubar() {
    const menu = document.getElementById("menu");
    const rotator = document.getElementById("icon");
    
    if (!menuOpen) {
        rotator.style.transform = "rotate(90deg)";
        menu.classList.add('active');
        menuOpen = true;
    } else {
        rotator.style.transform = "rotate(0deg)";
        menu.classList.remove('active');
        menuOpen = false;
        div_closer();
    }
}

// ===========================
// CUSTOMIZATION
// ===========================

const numButtons = document.querySelectorAll(".mainnum");
const displayer = document.getElementById("display-div");
const calcBackground = document.getElementById("main-div");
const resultColor = document.getElementById("number");

function color_changer(button) {
    const color = button.getAttribute("data-color");
    numButtons.forEach(function(numButton) {
        numButton.style.backgroundColor = color;
    });
}

function color_changer2(button) {
    const color = button.getAttribute("data-color");
    displayer.style.backgroundColor = color;
}

function color_changer3(button) {
    const color = button.getAttribute("data-color");
    calcBackground.style.backgroundColor = color;
}

function color_changer4(button) {
    const color = button.getAttribute("data-color");
    body.style.backgroundColor = color;
}

function color_changer5(button) {
    const color = button.getAttribute("data-color");
    resultColor.style.color = color;
}

function customizerdiv_setter() {
    const customDiv = document.getElementById("customization-div");
    const display = window.getComputedStyle(customDiv).display;
    customDiv.style.display = display === 'none' ? 'block' : 'none';
}

function div_closer() {
    const closer = document.getElementById("customization-div");
    if (window.getComputedStyle(closer).display === 'block') {
        closer.style.display = 'none';
    }
}

function restore_settings() {
    location.reload();
}

// ===========================
// HISTORY MANAGEMENT
// ===========================

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        history = JSON.parse(saved);
    }
}

function show_history() {
    const modal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999;">No history yet</p>';
    } else {
        historyList.innerHTML = '';
        history.slice().reverse().forEach(function(item) {
            const p = document.createElement('p');
            p.textContent = item;
            historyList.appendChild(p);
        });
    }
    
    modal.style.display = 'block';
}

function close_history() {
    document.getElementById('history-modal').style.display = 'none';
}

function clear_history() {
    if (confirm("Are you sure you want to clear the history?")) {
        history = [];
        saveHistory();
        alert("History cleared!");
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('history-modal');
    if (e.target === modal) {
        close_history();
    }
});

// Load history on page load
loadHistory();