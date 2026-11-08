/**
 * TypeZenith Ultra Max Pro++ Ecosystem Engine (Hard Fixes for Bengali Wrapping & Graphemes)
 */

const CORPORA = {
    en: [
        "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and clean implementation. Consistency and deliberate practice compound over time into mastery. Web development empowers creators to build tools that reach global audiences instantly.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. Quality software requires patience, rigorous testing, and continuous refactoring. Clean code always looks like it was written by someone who cares.",
        "Innovation distinguishes between a leader and a follower. Technology is best when it brings people together and solves genuine everyday problems. Keep learning, stay curious, and build things that matter.",
        "Simplicity is the soul of efficiency. Great user interfaces feel effortless because every detail has been meticulously considered. Performance and accessibility should never be an afterthought in modern engineering."
    ],
    bn: [
        "আকর্ষণীয় ও গতিশীল ওয়েবসাইট তৈরি করা আধুনিক ওয়েব ডেভেলপারদের মূল লক্ষ্য। নিয়মিত চর্চা ও অধ্যবসায়ের মাধ্যমে যেকোনো জটিল দক্ষতা অর্জন করা সম্ভব। প্রযুক্তির সঠিক ব্যবহারে জীবনযাত্রার মান উন্নত হয় এবং বিশ্ব আরও কাছাকাছি চলে আসে।",
        "শিক্ষা জাতির মেরুদণ্ড এবং জ্ঞানই শক্তি। কঠোর পরিশ্রম ও সততা সাফল্যের চাবিকাঠি। সময়ের সঠিক ব্যবহার এবং লক্ষ্য স্থির রেখে এগিয়ে গেলে যেকোনো কঠিন বাধা অতিক্রম করা যায়। নিজের উপর বিশ্বাস রাখুন এবং সামনের দিকে এগিয়ে চলুন।"
    ]
};

let state = {
    lang: 'en',
    modeType: 'time',
    timeLimit: 15,
    timeLeft: 15,
    wordLimit: 25,
    isPlaying: false,
    timerId: null,
    words: [],
    wordIndex: 0,
    charIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0,
    totalTyped: 0,
    errors: 0,
    soundEnabled: true,
    customText: null,
    wpmHistoryData: [],
    secondsElapsed: 0,
    failedWords: [],
    xp: parseInt(localStorage.getItem('typezenith_xp') || '0'),
    level: parseInt(localStorage.getItem('typezenith_level') || '1'),
    history: []
};

let wpmChartInstance = null;
let audioCtx = null;
let particleCanvas, ctx, particles = [];

function initParticles() {
    particleCanvas = document.getElementById('particleCanvas');
    if (!particleCanvas) return;
    ctx = particleCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            radius: Math.random() * 6 + 3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -Math.random() * 0.6 - 0.2,
            alpha: Math.random() * 0.3 + 0.1
        });
    }
    animateParticles();
}

function resizeCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

function animateParticles() {
    if (!ctx || !particleCanvas) return;
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#38bdf8';

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
            p.y = particleCanvas.height + 10;
            p.x = Math.random() * particleCanvas.width;
        }
        if (p.x < 0) p.x = particleCanvas.width;
        if (p.x > particleCanvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = p.alpha;
        ctx.stroke();
    });
    requestAnimationFrame(animateParticles);
}

function playSound(type = 'click') {
    if (!state.soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 + Math.random() * 40, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.03);
        } else if (type === 'bell') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    setupEventListeners();
    initParticles();
    initTest();
    updateUserXpDisplay();
});

function setupEventListeners() {
    elements = getDomElements();
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    elements.soundToggleBtn.addEventListener('click', toggleSound);

    elements.colorOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const color = e.target.closest('.color-opt').getAttribute('data-color');
            document.documentElement.setAttribute('data-accent', color);
            localStorage.setItem('typezenith_accent', color);
        });
    });

    elements.langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => setLanguage(e.target.getAttribute('data-lang')));
    });

    elements.typeModeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.typeModeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.modeType = e.target.getAttribute('data-modetype');
            
            if (state.modeType === 'time') {
                elements.timeOptions.classList.remove('d-none');
                elements.wordOptions.classList.add('d-none');
                elements.mainStatLabel.textContent = 'TIME';
            } else if (state.modeType === 'words') {
                elements.timeOptions.classList.add('d-none');
                elements.wordOptions.classList.remove('d-none');
                elements.mainStatLabel.textContent = 'WORDS';
            } else {
                elements.timeOptions.classList.add('d-none');
                elements.wordOptions.classList.add('d-none');
                elements.mainStatLabel.textContent = 'ZEN';
            }
            state.customText = null;
            resetTest();
        });
    });

    elements.timeButtons.forEach(btn => {
        if (btn.id === 'customTimeBtn') return;
        btn.addEventListener('click', (e) => {
            elements.timeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.timeLimit = parseInt(e.target.getAttribute('data-val'));
            resetTest();
        });
    });

    elements.customTimeBtn.addEventListener('click', () => {
        const customSecs = prompt("Enter custom time in seconds (e.g., 45, 90, 120):", "45");
        if (customSecs && !isNaN(customSecs) && parseInt(customSecs) > 0) {
            elements.timeButtons.forEach(b => b.classList.remove('active'));
            elements.customTimeBtn.classList.add('active');
            state.timeLimit = parseInt(customSecs);
            resetTest();
        }
    });

    elements.wordButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.wordButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.wordLimit = parseInt(e.target.getAttribute('data-val'));
            resetTest();
        });
    });

    elements.loadCustomTextBtn.addEventListener('click', () => {
        const val = elements.customTextInput.value.trim();
        if (val.length > 0) {
            state.customText = val;
            resetTest();
        }
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        const fontVal = elements.fontSelector.value;
        document.documentElement.setAttribute('data-font', fontVal);
        localStorage.setItem('typezenith_font', fontVal);
        resetTest();
    });

    elements.typingCard.addEventListener('click', () => {
        elements.hiddenInput.focus();
        elements.focusOverlay.classList.add('hidden');
    });

    elements.hiddenInput.addEventListener('blur', () => {
        if (state.isPlaying) elements.focusOverlay.classList.remove('hidden');
    });

    elements.hiddenInput.addEventListener('input', handleTypingInput);
    elements.hiddenInput.addEventListener('keydown', handleSpecialKeys);

    elements.restartBtn.addEventListener('click', () => resetTest());
    elements.pageRestartBtn.addEventListener('click', () => resetTest());

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetTest();
            e.preventDefault();
        }
    });
}

function getDomElements() {
    return {
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundIcon: document.getElementById('soundIcon'),
        langButtons: document.querySelectorAll('.lang-switcher .btn'),
        typeModeButtons: document.querySelectorAll('.type-mode-switcher .btn'),
        timeOptions: document.getElementById('timeOptions'),
        wordOptions: document.getElementById('wordOptions'),
        timeButtons: document.querySelectorAll('.time-btn'),
        customTimeBtn: document.getElementById('customTimeBtn'),
        wordButtons: document.querySelectorAll('.word-btn'),
        mainStatLabel: document.getElementById('mainStatLabel'),
        timerDisplay: document.getElementById('timerDisplay'),
        typingCard: document.getElementById('typingCard'),
        focusOverlay: document.getElementById('focusOverlay'),
        hiddenInput: document.getElementById('hiddenInput'),
        wordsDisplay: document.getElementById('wordsDisplay'),
        liveWpm: document.getElementById('liveWpm'),
        liveAcc: document.getElementById('liveAcc'),
        restartBtn: document.getElementById('restartBtn'),
        pageRestartBtn: document.getElementById('pageRestartBtn'),
        typingView: document.getElementById('typingView'),
        resultView: document.getElementById('resultView'),
        finalWpm: document.getElementById('finalWpm'),
        finalAcc: document.getElementById('finalAcc'),
        finalXp: document.getElementById('finalXp'),
        highScoreWpm: document.getElementById('highScoreWpm'),
        userLevel: document.getElementById('userLevel'),
        userXp: document.getElementById('userXp'),
        errorWordsList: document.getElementById('errorWordsList'),
        customTextInput: document.getElementById('customTextInput'),
        loadCustomTextBtn: document.getElementById('loadCustomTextBtn'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        fontSelector: document.getElementById('fontSelector'),
        colorOptions: document.querySelectorAll('.color-opt')
    };
}
let elements = {};

function setLanguage(lang) {
    state.lang = lang;
    elements.langButtons.forEach(b => {
        if (b.getAttribute('data-lang') === lang) b.classList.add('active');
        else b.classList.remove('active');
    });

    if (lang === 'bn') document.body.classList.add('lang-bn');
    else document.body.classList.remove('lang-bn');
    
    state.customText = null;
    resetTest();
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    elements.themeToggleBtn.querySelector('i').className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('typezenith_theme', newTheme);
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    elements.soundIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('typezenith_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    const savedAccent = localStorage.getItem('typezenith_accent');
    if (savedAccent) document.documentElement.setAttribute('data-accent', savedAccent);
    const savedFont = localStorage.getItem('typezenith_font');
    if (savedFont) {
        document.documentElement.setAttribute('data-font', savedFont);
        if (elements.fontSelector) elements.fontSelector.value = savedFont;
    }
}

function updateUserXpDisplay() {
    if (elements.userLevel) elements.userLevel.textContent = state.level;
    if (elements.userXp) elements.userXp.textContent = state.xp;
}

function initTest() {
    elements.typingView.classList.remove('d-none');
    elements.resultView.classList.add('d-none');

    if (state.modeType === 'time') {
        state.timeLeft = state.timeLimit;
        elements.timerDisplay.textContent = state.timeLeft;
    } else if (state.modeType === 'words') {
        elements.timerDisplay.textContent = `0/${state.wordLimit}`;
    } else {
        elements.timerDisplay.textContent = 'ZEN';
    }

    elements.liveWpm.textContent = '0';
    elements.liveAcc.textContent = '100%';

    let rawText = state.customText || CORPORA[state.lang][Math.floor(Math.random() * CORPORA[state.lang].length)];
    
    state.words = rawText.trim().split(/\s+/);
    if (state.modeType === 'words' && state.words.length > state.wordLimit) {
        state.words = state.words.slice(0, state.wordLimit);
    }

    state.wordIndex = 0;
    state.charIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.extraChars = 0;
    state.missedChars = 0;
    state.totalTyped = 0;
    state.errors = 0;
    state.failedWords = [];
    state.isPlaying = false;
    state.wpmHistoryData = [];
    state.secondsElapsed = 0;
    clearInterval(state.timerId);

    renderWords();
}

function renderWords() {
    elements.wordsDisplay.innerHTML = '';
    
    // Proper segmentation using Intl.Segmenter or Array.from for robust Unicode grapheme support in Bengali & English
    const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(state.lang === 'bn' ? 'bn' : 'en', { granularity: 'grapheme' }) : null;

    state.words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = `word ${wIdx === 0 ? 'active current-word' : ''}`;
        
        let chars = segmenter ? Array.from(segmenter.segment(word), s => s.segment) : Array.from(word);

        chars.forEach((char, cIdx) => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter';
            if (wIdx === 0 && cIdx === 0) letterSpan.classList.add('current-caret');
            letterSpan.textContent = char;
            wordSpan.appendChild(letterSpan);
        });
        elements.wordsDisplay.appendChild(wordSpan);
    });
}

function handleTypingInput(e) {
    const inputVal = e.target.value;
    if (!state.isPlaying && inputVal.length > 0) {
        startTimer();
        elements.focusOverlay.classList.add('hidden');
    }

    if (!state.isPlaying) return;

    playSound('click');

    const currentWordEl = elements.wordsDisplay.children[state.wordIndex];
    if (!currentWordEl) return;

    const letterEls = currentWordEl.querySelectorAll('.letter');
    const targetWord = state.words[state.wordIndex];
    const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(state.lang === 'bn' ? 'bn' : 'en', { granularity: 'grapheme' }) : null;
    const targetChars = segmenter ? Array.from(segmenter.segment(targetWord), s => s.segment) : Array.from(targetWord);

    elements.hiddenInput.value = '';

    for (let i = 0; i < inputVal.length; i++) {
        const char = inputVal[i];

        if (char === ' ') {
            if (state.charIndex > 0 || state.wordIndex === 0) {
                let wordHasError = false;
                for (let k = state.charIndex; k < letterEls.length; k++) {
                    letterEls[k].classList.add('incorrect');
                    state.missedChars++;
                    wordHasError = true;
                }
                if (wordHasError || currentWordEl.querySelector('.incorrect')) {
                    state.failedWords.push(targetWord);
                    currentWordEl.classList.add('error-word');
                }

                currentWordEl.classList.remove('active', 'current-word', 'at-end');
                removeCaretFromAll();

                state.wordIndex++;
                state.charIndex = 0;

                if (state.wordIndex < state.words.length) {
                    const nextWordEl = elements.wordsDisplay.children[state.wordIndex];
                    nextWordEl.classList.add('active', 'current-word');
                    nextWordEl.querySelector('.letter').classList.add('current-caret');
                    
                    // Auto scroll container if words exceed visual lines
                    if (nextWordEl.offsetTop > currentWordEl.offsetTop) {
                        // Wrapped to next line
                    }

                    if (state.modeType === 'words') {
                        elements.timerDisplay.textContent = `${state.wordIndex}/${state.wordLimit}`;
                    }
                } else {
                    endTest();
                }
                updateLiveStats();
            }
            return;
        }

        if (state.charIndex < targetChars.length) {
            state.totalTyped++;
            if (char === targetChars[state.charIndex]) {
                letterEls[state.charIndex].classList.add('correct');
                state.correctChars++;
            } else {
                letterEls[state.charIndex].classList.add('incorrect');
                state.incorrectChars++;
                state.errors++;
                triggerShake();
            }
            state.charIndex++;

            removeCaretFromAll();
            if (state.charIndex < letterEls.length) {
                letterEls[state.charIndex].classList.add('current-caret');
                currentWordEl.classList.remove('at-end');
            } else {
                currentWordEl.classList.add('at-end');
            }
        } else {
            state.extraChars++;
            state.errors++;
        }
    }
    updateLiveStats();
}

function handleSpecialKeys(e) {
    if (e.key === 'Backspace') {
        if (!state.isPlaying) return;
        playSound('click');
        
        const currentWordEl = elements.wordsDisplay.children[state.wordIndex];
        if (!currentWordEl) return;
        const letterEls = currentWordEl.querySelectorAll('.letter');

        if (state.charIndex > 0) {
            state.charIndex--;
            removeCaretFromAll();
            letterEls[state.charIndex].className = 'letter current-caret';
            currentWordEl.classList.remove('at-end');
        } else if (state.wordIndex > 0) {
            currentWordEl.classList.remove('active', 'current-word', 'at-end');
            removeCaretFromAll();

            state.wordIndex--;
            const prevWordEl = elements.wordsDisplay.children[state.wordIndex];
            prevWordEl.classList.add('active', 'current-word');
            
            const prevLetters = prevWordEl.querySelectorAll('.letter');
            state.charIndex = prevLetters.length;
            prevWordEl.classList.add('at-end');
        }
        e.preventDefault();
        updateLiveStats();
    }
}

function triggerShake() {
    elements.typingCard.classList.add('shake-effect');
    setTimeout(() => elements.typingCard.classList.remove('shake-effect'), 200);
}

function removeCaretFromAll() {
    document.querySelectorAll('.current-caret').forEach(el => el.classList.remove('current-caret'));
    document.querySelectorAll('.at-end').forEach(el => el.classList.remove('at-end'));
}

function startTimer() {
    state.isPlaying = true;
    state.secondsElapsed = 0;

    state.timerId = setInterval(() => {
        state.secondsElapsed++;
        if (state.modeType === 'time') {
            state.timeLeft--;
            elements.timerDisplay.textContent = state.timeLeft;
            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                endTest();
            }
        } else if (state.modeType === 'zen') {
            elements.timerDisplay.textContent = state.secondsElapsed;
        }
        const currentWpm = calculateCurrentWpm();
        state.wpmHistoryData.push(currentWpm);
        updateLiveStats();
    }, 1000);
}

function calculateCurrentWpm() {
    const mins = state.secondsElapsed / 60;
    if (mins <= 0) return 0;
    return Math.round((state.correctChars / 5) / mins);
}

function updateLiveStats() {
    const wpm = calculateCurrentWpm();
    let accuracy = 100;
    const totalAttempted = state.correctChars + state.incorrectChars;
    if (totalAttempted > 0) {
        accuracy = Math.round((state.correctChars / totalAttempted) * 100);
    }

    elements.liveWpm.textContent = wpm < 0 ? 0 : wpm;
    elements.liveAcc.textContent = `${accuracy}%`;
}

function endTest() {
    state.isPlaying = false;
    clearInterval(state.timerId);
    elements.hiddenInput.blur();
    playSound('bell');

    const totalTimeMins = (state.modeType === 'time' ? state.timeLimit : state.secondsElapsed) / 60;
    const netWpm = Math.max(0, Math.round((state.correctChars / 5) / (totalTimeMins > 0 ? totalTimeMins : 0.5)));
    const totalAttempted = state.correctChars + state.incorrectChars;
    const finalAccuracy = totalAttempted > 0 ? Math.round((state.correctChars / totalAttempted) * 100) : 100;

    const earnedXp = Math.round(netWpm * 1.5 + finalAccuracy * 0.5);
    state.xp += earnedXp;
    if (state.xp >= state.level * 500) state.level++;
    localStorage.setItem('typezenith_xp', state.xp);
    localStorage.setItem('typezenith_level', state.level);
    updateUserXpDisplay();

    elements.typingView.classList.add('d-none');
    elements.resultView.classList.remove('d-none');

    elements.finalWpm.textContent = netWpm;
    elements.finalAcc.textContent = `${finalAccuracy}%`;
    elements.finalXp.textContent = `+${earnedXp}`;

    elements.errorWordsList.innerHTML = '';
    if (state.failedWords.length > 0) {
        [...new Set(state.failedWords)].forEach(word => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger text-white px-2 py-1';
            badge.textContent = word;
            elements.errorWordsList.appendChild(badge);
        });
    } else {
        elements.errorWordsList.innerHTML = '<span class="text-success">Flawless execution! Zero error words.</span>';
    }

    let highScore = parseInt(localStorage.getItem('typezenith_highscore') || '0');
    if (netWpm > highScore) {
        highScore = netWpm;
        localStorage.setItem('typezenith_highscore', highScore);
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }
    elements.highScoreWpm.textContent = `${highScore} WPM`;

    renderWpmChart();
}

function renderWpmChart() {
    const ctx = document.getElementById('wpmChart').getContext('2d');
    if (wpmChartInstance) wpmChartInstance.destroy();

    wpmChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: state.wpmHistoryData.map((_, i) => `${i + 1}s`),
            datasets: [{
                label: 'WPM Progression',
                data: state.wpmHistoryData,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { size: 10 } } }
            }
        }
    });
}

function resetTest() {
    initTest();
    elements.hiddenInput.focus();
    elements.focusOverlay.classList.add('hidden');
}
