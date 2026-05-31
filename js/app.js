const DEFAULT_SEATED = [
    { id: "s1", name: "Éveil et Ancrage (Respiration)", duration: 60, desc: "Asseyez-vous bien droit, les pieds à plat au sol. Levez doucement les bras à l'inspiration, puis abaissez-les à l'expiration.", posture: "Gardez le dos droit et aligné, détendez vos épaules." },
    { id: "s2", name: "Pousser la Montagne", duration: 60, desc: "Poussez lentement vos paumes vers l'avant à l'expiration, puis ramenez-les vers la poitrine à l'inspiration.", posture: "Épaules basses, étirement doux des poignets." },
    { id: "s3", name: "Séparer la Crinière du Cheval Sauvage", duration: 80, desc: "Tournez doucement le buste en ouvrant un bras vers le haut et l'autre vers le bas en alternance.", posture: "Suivez le mouvement des yeux, ne forcez pas sur le bas du dos." },
    { id: "s4", name: "Brosser le Genou et Pousser", duration: 80, desc: "Une main balaie le genou tandis que l'autre pousse vers l'avant avec intention.", posture: "Gardez le buste bien droit." },
    { id: "s5", name: "Soulever le Ciel (Jambes)", duration: 80, desc: "Tendez une jambe devant vous en expirant, puis reposez-la. Alternez les jambes.", posture: "Idéal pour renforcer les cuisses (quadriceps) sans pression sur les genoux." },
    { id: "s6", name: "Mouvoir les Mains comme des Nuages", duration: 80, desc: "Faites glisser vos mains de gauche à droite comme des nuages portés par le vent, en accompagnant du buste.", posture: "Respiration calme et rotation fluide de la taille." },
    { id: "s7", name: "Repousser le Singe", duration: 80, desc: "Poussez une main vers l'avant tout en ramenant l'autre vers votre hanche dans un geste continu.", posture: "Ouvrez le thorax et respirez de façon ample." },
    { id: "s8", name: "Fermeture & Harmonie", duration: 60, desc: "Posez vos deux mains l'une sur l'autre au niveau de votre bas-ventre et respirez calmement.", posture: "Fermez les yeux et appréciez le calme intérieur." }
];

const DEFAULT_STANDING = [
    { id: "st1", name: "Commencer le Tai Chi", duration: 60, desc: "Montez les bras à hauteur d'épaules puis laissez-les redescendre en fléchissant légèrement les genoux.", posture: "Gardez les genoux bien alignés avec les orteils." },
    { id: "st2", name: "Parer et Presser", duration: 80, desc: "Formez un ballon d'énergie devant vous, puis pressez vers l'avant en transférant le poids sur la jambe avant.", posture: "Sentez l'ancrage de vos pieds dans le sol." },
    { id: "st3", name: "Caresser la Queue du Moineau", duration: 80, desc: "Enchaînement circulaire de parer, tirer, presser et pousser avec transfert de poids.", posture: "Gardez le bassin droit et la colonne étirée." },
    { id: "st4", name: "Simple Fouet", duration: 80, desc: "Déployez un bras sur le côté en forme de crochet et l'autre ouvert vers l'extérieur dans une posture large.", posture: "Épaules basses, bras détendus mais actifs." },
    { id: "st5", name: "La Grue Blanche déploie ses Ailes", duration: 80, desc: "Posez le pied avant sur la pointe, levez une main au niveau du front et descendez l'autre près de la hanche.", posture: "90% du poids sur la jambe arrière pour travailler l'équilibre." },
    { id: "st6", name: "Brosser le Genou et Pas en Avant", duration: 80, desc: "Avancez d'un pas en brossant doucement le genou avant avec la main basse et en poussant de l'autre.", posture: "Ne dépassez pas le bout du pied avec votre genou avant." },
    { id: "st7", name: "Jouer du Luth", duration: 80, desc: "Revenez en appui arrière, talon avant posé au sol, mains tenant un luth imaginaire à hauteur de poitrine.", posture: "Excellent exercice pour renforcer la jambe arrière et l'équilibre." },
    { id: "st8", name: "Fermeture du Tai Chi", duration: 60, desc: "Ramenez vos pieds joints, croisez les mains devant vous et ramenez l'énergie vers le bas.", posture: "Calmez votre rythme cardiaque et détendez-vous." }
];

// App State
let exercises = { seated: [], standing: [] };
let activeExercisesList = [];
let currentMode = 'seated'; // 'seated' or 'standing'
let currentIndex = 0;
let isPlaying = false;
let isRestPhase = false;
let timerSeconds = 0;
let restDuration = 30; // seconds
let intervalId = null;
let useSpeech = true;
let useGong = true;

// Onboarding Quiz State
let quizAnswers = { activity: '', goal: '', posture: '' };

// Habit Tracker State
let dailyWater = 0;
let completedHistory = []; // array of date strings 'YYYY-MM-DD'
let userStreak = 0;

// Onboarding & Initial Load
function initApp() {
    loadAppState();
    setupEventListeners();
    checkOnboarding();
    switchTab('today');
}

function loadAppState() {
    // Exercises
    const storedEx = localStorage.getItem('taichi_exercises_v2');
    if (storedEx) {
        try { exercises = JSON.parse(storedEx); } catch (e) { resetToDefaults(); }
    } else {
        resetToDefaults();
    }

    // Quiz / Onboarding Check
    const storedQuiz = localStorage.getItem('taichi_quiz_answers');
    if (storedQuiz) {
        quizAnswers = JSON.parse(storedQuiz);
        currentMode = quizAnswers.posture || 'seated';
    }

    // Audio & Settings
    const speech = localStorage.getItem('taichi_setting_speech');
    if (speech !== null) useSpeech = speech === 'true';
    const gong = localStorage.getItem('taichi_setting_gong');
    if (gong !== null) useGong = gong === 'true';
    const rest = localStorage.getItem('taichi_setting_rest');
    if (rest !== null) restDuration = parseInt(rest, 10);

    // Habits & Streaks
    const water = localStorage.getItem('taichi_daily_water_' + getTodayDateString());
    if (water !== null) dailyWater = parseInt(water, 10);
    else dailyWater = 0;

    const history = localStorage.getItem('taichi_completed_history');
    if (history) {
        try { completedHistory = JSON.parse(history); } catch (e) { completedHistory = []; }
    }
    
    calculateStreak();
}

function resetToDefaults() {
    exercises.seated = JSON.parse(JSON.stringify(DEFAULT_SEATED));
    exercises.standing = JSON.parse(JSON.stringify(DEFAULT_STANDING));
    saveExercises();
}

function saveExercises() {
    localStorage.setItem('taichi_exercises_v2', JSON.stringify(exercises));
}

function checkOnboarding() {
    if (!quizAnswers.posture) {
        document.getElementById('screen-quiz').classList.remove('hidden');
        document.getElementById('main-app-content').classList.add('hidden');
    } else {
        document.getElementById('screen-quiz').classList.add('hidden');
        document.getElementById('main-app-content').classList.remove('hidden');
        updateAllTabViews();
    }
}

// Onboarding Quiz selection
window.selectQuizOption = function(stepName, value) {
    quizAnswers[stepName] = value;
    localStorage.setItem('taichi_quiz_answers', JSON.stringify(quizAnswers));

    if (stepName === 'activity') {
        document.getElementById('quiz-step-1').classList.add('hidden');
        document.getElementById('quiz-step-2').classList.remove('hidden');
    } else if (stepName === 'goal') {
        document.getElementById('quiz-step-2').classList.add('hidden');
        document.getElementById('quiz-step-3').classList.remove('hidden');
    } else if (stepName === 'posture') {
        document.getElementById('quiz-step-3').classList.add('hidden');
        currentMode = value;
        
        // Auto customize initial times based on beginner setting
        if (quizAnswers.activity === 'beginner') {
            // slightly shorter starting times for beginners
            exercises.seated.forEach(ex => ex.duration = Math.max(30, ex.duration - 10));
            exercises.standing.forEach(ex => ex.duration = Math.max(30, ex.duration - 10));
            saveExercises();
        }
        
        checkOnboarding();
    }
};

// Main layout navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    if (tabId === 'today') {
        document.getElementById('tab-today').classList.remove('hidden');
        document.getElementById('nav-btn-today').classList.add('active');
        updateTodayTab();
    } else if (tabId === 'programs') {
        document.getElementById('tab-programs').classList.remove('hidden');
        document.getElementById('nav-btn-programs').classList.add('active');
        updateProgramsTab();
    } else if (tabId === 'profile') {
        document.getElementById('tab-profile').classList.remove('hidden');
        document.getElementById('nav-btn-profile').classList.add('active');
        updateProfileTab();
    }
}

function updateAllTabViews() {
    updateTodayTab();
    updateProgramsTab();
    updateProfileTab();
}

// TAB 1: TODAY (Aujourd'hui)
function updateTodayTab() {
    activeExercisesList = exercises[currentMode];
    const totalSecs = calculateTotalDuration(activeExercisesList);
    
    document.getElementById('lbl-header-streak').textContent = `🔥 ${userStreak} jours`;
    document.getElementById('lbl-today-subtitle').textContent = currentMode === 'seated' ? 'Routine Assise (Chaise)' : 'Routine Debout';
    document.getElementById('lbl-today-duration').textContent = formatTime(totalSecs);
    document.getElementById('lbl-today-count').textContent = activeExercisesList.length + ' formes';
    document.getElementById('lbl-water-count').textContent = dailyWater;

    // Display summary list under start button
    const listContainer = document.getElementById('home-exercise-list');
    listContainer.innerHTML = '';
    
    if (activeExercisesList.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Aucun exercice configuré. Veuillez les réinitialiser dans l\'onglet Programmes.</p>';
        document.getElementById('btn-start-today').disabled = true;
        return;
    }
    document.getElementById('btn-start-today').disabled = false;

    activeExercisesList.forEach((ex, idx) => {
        const item = document.createElement('div');
        item.className = 'exercise-summary-card';
        item.innerHTML = `
            <div class="ex-num">${idx + 1}</div>
            <div class="ex-details">
                <h3>${ex.name}</h3>
                <p class="ex-meta">${ex.duration}s | Posture : ${ex.posture}</p>
            </div>
        `;
        listContainer.appendChild(item);
    });

    // Handle session duration warnings
    const warningEl = document.getElementById('warning-today-time-limit');
    if (totalSecs > 15 * 60) {
        warningEl.classList.remove('hidden');
        warningEl.textContent = "Attention : La séance dépasse 15 minutes (" + formatTime(totalSecs) + "). Vous pouvez raccourcir la durée des exercices dans l'onglet Programmes.";
    } else {
        warningEl.classList.add('hidden');
    }
}

// TAB 2: PROGRAMS (Configuration)
function updateProgramsTab() {
    document.getElementById('btn-prog-seated').classList.toggle('active', currentMode === 'seated');
    document.getElementById('btn-prog-standing').classList.toggle('active', currentMode === 'standing');

    const labelRestValue = document.getElementById('lbl-prog-rest-value');
    labelRestValue.textContent = restDuration + "s";

    document.getElementById('switch-prog-speech').checked = useSpeech;
    document.getElementById('switch-prog-gong').checked = useGong;
}

// TAB 3: PROFILE & STATS
function updateProfileTab() {
    document.getElementById('lbl-profile-streak').textContent = userStreak;
    document.getElementById('lbl-profile-total').textContent = completedHistory.length;
    
    // Level Badge description
    const levelNameEl = document.getElementById('lbl-profile-level-name');
    const levelAdaptationEl = document.getElementById('lbl-profile-adaptation');
    
    if (completedHistory.length >= 20) {
        levelNameEl.textContent = "Maître Zen ☯";
        levelAdaptationEl.textContent = "Progression personnalisée stable.";
    } else if (completedHistory.length >= 8) {
        levelNameEl.textContent = "Intermédiaire";
        levelAdaptationEl.textContent = "Formes ajustées en fonction de l'évaluation.";
    } else {
        levelNameEl.textContent = "Pratiquant Débutant";
        levelAdaptationEl.textContent = "Ajustements automatiques de la durée active.";
    }

    // Render calendar grid for past 7 days
    const calendarGrid = document.getElementById('calendar-days-grid');
    calendarGrid.innerHTML = '';
    
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const isCompleted = completedHistory.includes(dateStr);
        const dayLabel = dayNames[d.getDay()];

        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell' + (isCompleted ? ' completed' : '');
        cell.innerHTML = `
            <span class="day-name">${dayLabel}</span>
            <strong>${d.getDate()}</strong>
            <span style="font-size: 0.6rem;">${isCompleted ? '✓' : ''}</span>
        `;
        calendarGrid.appendChild(cell);
    }
}

// Event Listeners setup
function setupEventListeners() {
    // Bottom Nav buttons
    document.getElementById('nav-btn-today').addEventListener('click', () => switchTab('today'));
    document.getElementById('nav-btn-programs').addEventListener('click', () => switchTab('programs'));
    document.getElementById('nav-btn-profile').addEventListener('click', () => switchTab('profile'));

    // Today tab actions
    document.getElementById('btn-start-today').addEventListener('click', startWorkout);
    document.getElementById('btn-add-water').addEventListener('click', addWaterIntake);
    document.getElementById('btn-start-breathing').addEventListener('click', startBreathingGame);

    // Programs tab toggles & settings
    document.getElementById('btn-prog-seated').addEventListener('click', () => { currentMode = 'seated'; updateProgramsTab(); updateTodayTab(); });
    document.getElementById('btn-prog-standing').addEventListener('click', () => { currentMode = 'standing'; updateProgramsTab(); updateTodayTab(); });
    
    document.getElementById('btn-prog-rest-minus').addEventListener('click', () => adjustRestTime(-5));
    document.getElementById('btn-prog-rest-plus').addEventListener('click', () => adjustRestTime(5));

    document.getElementById('switch-prog-speech').addEventListener('change', (e) => {
        useSpeech = e.target.checked;
        localStorage.setItem('taichi_setting_speech', useSpeech);
    });
    document.getElementById('switch-prog-gong').addEventListener('change', (e) => {
        useGong = e.target.checked;
        localStorage.setItem('taichi_setting_gong', useGong);
    });

    document.getElementById('btn-prog-manage-exercises').addEventListener('click', openEditor);
    document.getElementById('btn-prog-reset').addEventListener('click', () => {
        if(confirm("Réinitialiser les listes d'exercices d'origine ?")) {
            resetToDefaults();
            updateAllTabViews();
            alert("Routines restaurées !");
        }
    });

    // Profile actions
    document.getElementById('btn-reset-quiz').addEventListener('click', () => {
        if (confirm("Voulez-vous réinitialiser vos paramètres et refaire le questionnaire ?")) {
            localStorage.removeItem('taichi_quiz_answers');
            quizAnswers = { activity: '', goal: '', posture: '' };
            checkOnboarding();
        }
    });

    // Player action events
    document.getElementById('btn-player-play').addEventListener('click', togglePlay);
    document.getElementById('btn-player-skip').addEventListener('click', skipStep);
    document.getElementById('btn-player-back').addEventListener('click', stopWorkout);

    // Cardiac coherence game back button
    document.getElementById('btn-breath-back').addEventListener('click', stopBreathingGame);

    // Modal overlay events
    document.getElementById('form-exercise').addEventListener('submit', saveExerciseModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeExerciseModal);
    
    // Editor back buttons
    document.getElementById('btn-editor-back').addEventListener('click', closeEditor);
    document.getElementById('btn-add-exercise').addEventListener('click', () => openExerciseModal());
    document.getElementById('btn-reset-exercises').addEventListener('click', () => {
        if(confirm("Voulez-vous restaurer les listes d'origine ?")) {
            resetToDefaults();
            renderEditorList();
            updateAllTabViews();
        }
    });
}

function adjustRestTime(value) {
    if (restDuration + value >= 10 && restDuration + value <= 90) {
        restDuration += value;
        document.getElementById('lbl-prog-rest-value').textContent = restDuration + "s";
        localStorage.setItem('taichi_setting_rest', restDuration);
        updateTodayTab();
    }
}

// Habit Trackers: Hydration
function addWaterIntake() {
    dailyWater++;
    localStorage.setItem('taichi_daily_water_' + getTodayDateString(), dailyWater);
    document.getElementById('lbl-water-count').textContent = dailyWater;
}

// Habit Trackers: Cardiac Coherence
let breathingInterval = null;
let breathingGameSeconds = 120;
let breathingCycleState = 'in'; // 'in' or 'out'

function startBreathingGame() {
    document.getElementById('main-app-content').classList.add('hidden');
    document.getElementById('screen-breathing-game').classList.remove('hidden');
    
    breathingGameSeconds = 120;
    breathingCycleState = 'in';
    
    const circle = document.getElementById('breath-game-circle');
    const instruction = document.getElementById('breath-game-instruction');
    const timerLabel = document.getElementById('breath-game-timer');

    circle.className = "breathe-game-circle breathe-in";
    instruction.textContent = "Inspirez lentement...";
    timerLabel.textContent = "2:00";
    
    if (useSpeech) speak("Démarrage de la cohérence cardiaque. Inspirez pendant 5 secondes.");

    let cycleCounter = 0;
    clearInterval(breathingInterval);
    breathingInterval = setInterval(() => {
        breathingGameSeconds--;
        cycleCounter++;

        // 5s Inhale, 5s Exhale loop
        if (cycleCounter >= 5) {
            cycleCounter = 0;
            if (breathingCycleState === 'in') {
                breathingCycleState = 'out';
                circle.className = "breathe-game-circle breathe-out";
                instruction.textContent = "Expirez lentement...";
                if (useSpeech) speak("Expirez.");
            } else {
                breathingCycleState = 'in';
                circle.className = "breathe-game-circle breathe-in";
                instruction.textContent = "Inspirez profondément...";
                if (useSpeech) speak("Inspirez.");
            }
        }

        // Format and show remaining time
        const m = Math.floor(breathingGameSeconds / 60);
        const s = breathingGameSeconds % 60;
        timerLabel.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (breathingGameSeconds <= 0) {
            clearInterval(breathingInterval);
            if (useSpeech) speak("Cohérence cardiaque complétée. Bien joué.");
            stopBreathingGame();
        }
    }, 1000);
}

function stopBreathingGame() {
    clearInterval(breathingInterval);
    document.getElementById('main-app-content').classList.remove('hidden');
    document.getElementById('screen-breathing-game').classList.add('hidden');
    window.speechSynthesis.cancel();
}

// Workout Player Logic
function speak(text) {
    if (!useSpeech) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85; // comforting, slow paced
    window.speechSynthesis.speak(utterance);
}

function startWorkout() {
    activeExercisesList = exercises[currentMode];
    if (activeExercisesList.length === 0) return;

    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {});
    }

    currentIndex = 0;
    isRestPhase = false;
    timerSeconds = activeExercisesList[currentIndex].duration;
    isPlaying = true;

    document.getElementById('main-app-content').classList.add('hidden');
    document.getElementById('screen-player').classList.remove('hidden');

    document.getElementById('btn-player-play').innerHTML = '<span>⏸</span> Pause';
    
    updatePlayerUI();

    if (useGong) window.zenSounds.playGong();
    speak("Début de séance. Exercice 1 : " + activeExercisesList[currentIndex].name + ". C'est parti.");

    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);
}

function stopWorkout() {
    clearInterval(intervalId);
    isPlaying = false;
    document.getElementById('main-app-content').classList.remove('hidden');
    document.getElementById('screen-player').classList.add('hidden');
    window.speechSynthesis.cancel();
    updateTodayTab();
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('btn-player-play');
    if (isPlaying) {
        btn.innerHTML = '<span>⏸</span> Pause';
        intervalId = setInterval(tick, 1000);
        speak("Reprise");
    } else {
        btn.innerHTML = '<span>▶</span> Reprendre';
        clearInterval(intervalId);
        speak("Pause");
    }
}

function tick() {
    if (!isPlaying) return;
    timerSeconds--;

    if (timerSeconds <= 0) {
        if (!isRestPhase) {
            // Exercise ended
            if (currentIndex < activeExercisesList.length - 1) {
                isRestPhase = true;
                timerSeconds = restDuration;
                if (useGong) window.zenSounds.playBowl();
                const nextEx = activeExercisesList[currentIndex + 1].name;
                speak("Mouvement complété. Relâchez et respirez. Suivant : " + nextEx);
            } else {
                // Workout completed!
                finishWorkout();
            }
        } else {
            // Rest ended
            currentIndex++;
            isRestPhase = false;
            timerSeconds = activeExercisesList[currentIndex].duration;
            if (useGong) window.zenSounds.playGong();
            speak("Début du mouvement : " + activeExercisesList[currentIndex].name);
        }
    }
    updatePlayerUI();
}

function skipStep() {
    if (!isRestPhase) {
        if (currentIndex < activeExercisesList.length - 1) {
            isRestPhase = true;
            timerSeconds = restDuration;
            if (useGong) window.zenSounds.playBowl();
            speak("Mouvement passé. Repos. Suivant : " + activeExercisesList[currentIndex + 1].name);
        } else {
            finishWorkout();
        }
    } else {
        isRestPhase = false;
        currentIndex++;
        timerSeconds = activeExercisesList[currentIndex].duration;
        if (useGong) window.zenSounds.playGong();
        speak("Début du mouvement : " + activeExercisesList[currentIndex].name);
    }
    updatePlayerUI();
}

function updatePlayerUI() {
    const ex = activeExercisesList[currentIndex];
    const titleEl = document.getElementById('player-exercise-title');
    const phaseEl = document.getElementById('player-phase-name');
    const descEl = document.getElementById('player-exercise-desc');
    const postureEl = document.getElementById('player-exercise-posture');
    const timerValueEl = document.getElementById('player-timer-value');
    const circleProgress = document.getElementById('player-circle-progress');
    const nextPreviewEl = document.getElementById('player-next-preview');
    const progressTextEl = document.getElementById('player-progress-text');
    const breathingGuide = document.getElementById('breathing-guide');

    if (isRestPhase) {
        phaseEl.textContent = "PAUSE RESPIRATOIRE";
        phaseEl.className = "phase-badge rest";
        titleEl.textContent = "Respirer & Relâcher";
        descEl.textContent = "Relâchez vos bras et prenez des inspirations calmes.";
        postureEl.textContent = "Posture : Assis bien droit ou debout, épaules détendues.";
        
        const nextEx = activeExercisesList[currentIndex + 1];
        nextPreviewEl.textContent = "Suivant : " + nextEx.name;
        nextPreviewEl.classList.remove('hidden');
        
        breathingGuide.className = "breathing-circle breathing-active-slow";
        document.getElementById('breathing-txt').textContent = "Souffle calme";
    } else {
        phaseEl.textContent = `EXERCICE ${currentIndex + 1} / ${activeExercisesList.length}`;
        phaseEl.className = "phase-badge active-workout";
        titleEl.textContent = ex.name;
        descEl.textContent = ex.desc;
        postureEl.textContent = "Attention : " + ex.posture;
        nextPreviewEl.classList.add('hidden');
        
        breathingGuide.className = "breathing-circle breathing-active-normal";
        document.getElementById('breathing-txt').textContent = "Suivre le rythme";
    }

    // Format remaining time
    const min = Math.floor(timerSeconds / 60);
    const sec = timerSeconds % 60;
    timerValueEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    // Circular countdown percentage progress
    const maxTime = isRestPhase ? restDuration : ex.duration;
    const progressPercent = ((maxTime - timerSeconds) / maxTime) * 100;
    const dashOffset = 565.48 - (565.48 * progressPercent) / 100;
    circleProgress.style.strokeDashoffset = dashOffset;

    // Overall session progress bar
    const overallProgress = document.getElementById('player-overall-progress');
    const totalSteps = activeExercisesList.length * 2 - 1;
    const currentStep = currentIndex * 2 + (isRestPhase ? 1 : 0);
    const progressWidth = (currentStep / totalSteps) * 100;
    overallProgress.style.width = `${progressWidth}%`;
    progressTextEl.textContent = `Progression globale : ${Math.round(progressWidth)}%`;
}

function finishWorkout() {
    clearInterval(intervalId);
    isPlaying = false;
    
    // Save completion to history
    const dateStr = getTodayDateString();
    if (!completedHistory.includes(dateStr)) {
        completedHistory.push(dateStr);
        localStorage.setItem('taichi_completed_history', JSON.stringify(completedHistory));
    }
    
    calculateStreak();

    // Show Feedback evaluation (MadMuscles style)
    document.getElementById('screen-player').classList.add('hidden');
    document.getElementById('screen-feedback').classList.remove('hidden');

    if (useGong) window.zenSounds.playGong();
    speak("Séance matinale complétée. Bravo à vous. Veuillez évaluer la séance pour adapter la difficulté.");
}

// Adaptive progression algorithm (MadMuscles)
window.submitAdaptation = function(rating) {
    const list = exercises[currentMode];
    let adjusted = false;

    if (rating === 'easy') {
        // Increase time by 10 seconds
        list.forEach(ex => { ex.duration += 10; });
        adjusted = true;
        speak("Très bien. Vos exercices seront rallongés de 10 secondes pour progresser.");
    } else if (rating === 'hard') {
        // Decrease time by 10 seconds (minimum 30s)
        list.forEach(ex => { ex.duration = Math.max(30, ex.duration - 10); });
        adjusted = true;
        speak("Reçu. Les exercices seront écourtés de 10 secondes pour préserver vos articulations.");
    } else {
        speak("Parfait. Nous gardons cette intensité pour demain.");
    }

    if (adjusted) {
        saveExercises();
    }
    
    skipAdaptationFeedback();
};

window.skipAdaptationFeedback = function() {
    document.getElementById('screen-feedback').classList.add('hidden');
    document.getElementById('main-app-content').classList.remove('hidden');
    switchTab('today');
    updateAllTabViews();
};

// Helpers for calculations
function calculateTotalDuration(list) {
    if (list.length === 0) return 0;
    return list.reduce((sum, item) => sum + item.duration, 0) + (list.length - 1) * restDuration;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} min ${s > 0 ? s + ' s' : ''}`;
}

function getTodayDateString() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getYesterdayDateString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function calculateStreak() {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (completedHistory.includes(today)) {
        // Find consecutive previous days
        let count = 1;
        let d = new Date();
        while (true) {
            d.setDate(d.getDate() - 1);
            const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (completedHistory.includes(dateStr)) {
                count++;
            } else {
                break;
            }
        }
        userStreak = count;
    } else if (completedHistory.includes(yesterday)) {
        let count = 0;
        let d = new Date();
        d.setDate(d.getDate() - 1); // start from yesterday
        while (true) {
            const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (completedHistory.includes(dateStr)) {
                count++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        userStreak = count;
    } else {
        userStreak = 0;
    }
}

// Workout editor CRUD views
const editorScreen = document.getElementById('screen-editor');

function openEditor() {
    document.getElementById('main-app-content').classList.add('hidden');
    editorScreen.classList.remove('hidden');
    renderEditorList();
}

function closeEditor() {
    document.getElementById('main-app-content').classList.remove('hidden');
    editorScreen.classList.add('hidden');
    updateAllTabViews();
}

function renderEditorList() {
    const list = exercises[currentMode];
    const container = document.getElementById('editor-exercises-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-msg">Aucun exercice actif. Cliquez sur "Ajouter" pour en créer un.</p>';
        return;
    }

    list.forEach((ex, index) => {
        const item = document.createElement('div');
        item.className = 'editor-exercise-item';
        item.innerHTML = `
            <div class="ex-info">
                <h4>${ex.name} (${ex.duration}s)</h4>
                <p>${ex.desc.substring(0, 80)}${ex.desc.length > 80 ? '...' : ''}</p>
            </div>
            <div class="ex-actions">
                <button class="btn-icon btn-edit" title="Modifier" onclick="editExerciseItem('${ex.id}')">✏️</button>
                <button class="btn-icon btn-delete" title="Supprimer" onclick="deleteExerciseItem('${ex.id}')">🗑️</button>
                <div class="order-btns">
                    <button class="btn-icon btn-arrow" title="Monter" onclick="moveExerciseItem('${ex.id}', -1)" ${index === 0 ? 'disabled' : ''}>▲</button>
                    <button class="btn-icon btn-arrow" title="Descendre" onclick="moveExerciseItem('${ex.id}', 1)" ${index === list.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Edit actions export
window.editExerciseItem = function(id) {
    const list = exercises[currentMode];
    const ex = list.find(item => item.id === id);
    if (ex) {
        openExerciseModal(ex);
    }
};

window.deleteExerciseItem = function(id) {
    if (confirm("Voulez-vous supprimer cet exercice ?")) {
        const list = exercises[currentMode];
        exercises[currentMode] = list.filter(item => item.id !== id);
        saveExercises();
        renderEditorList();
    }
};

window.moveExerciseItem = function(id, direction) {
    const list = exercises[currentMode];
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return;
    
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= list.length) return;
    
    // Swap elements
    const temp = list[idx];
    list[idx] = list[newIdx];
    list[newIdx] = temp;
    
    saveExercises();
    renderEditorList();
};

// Exercise Dialog controls
let editingId = null;

function openExerciseModal(ex = null) {
    const modal = document.getElementById('modal-exercise');
    const title = document.getElementById('modal-title');
    modal.classList.remove('hidden');
    
    if (ex) {
        title.textContent = "Modifier l'exercice";
        editingId = ex.id;
        document.getElementById('in-name').value = ex.name;
        document.getElementById('in-duration').value = ex.duration;
        document.getElementById('in-desc').value = ex.desc;
        document.getElementById('in-posture').value = ex.posture;
    } else {
        title.textContent = "Ajouter un exercice";
        editingId = null;
        document.getElementById('in-name').value = '';
        document.getElementById('in-duration').value = '60';
        document.getElementById('in-desc').value = '';
        document.getElementById('in-posture').value = '';
    }
}

function closeExerciseModal() {
    document.getElementById('modal-exercise').classList.add('hidden');
}

function saveExerciseModal(e) {
    e.preventDefault();
    
    const name = document.getElementById('in-name').value.trim();
    const duration = parseInt(document.getElementById('in-duration').value, 10);
    const desc = document.getElementById('in-desc').value.trim();
    const posture = document.getElementById('in-posture').value.trim();
    
    if (!name || isNaN(duration) || duration <= 0) {
        alert("Saisie incorrecte.");
        return;
    }
    
    const list = exercises[currentMode];
    
    if (editingId) {
        const idx = list.findIndex(item => item.id === editingId);
        if (idx !== -1) {
            list[idx].name = name;
            list[idx].duration = duration;
            list[idx].desc = desc;
            list[idx].posture = posture;
        }
    } else {
        list.push({
            id: 'custom_' + Date.now(),
            name,
            duration,
            desc,
            posture
        });
    }
    
    saveExercises();
    closeExerciseModal();
    renderEditorList();
}

// Start up when loaded
window.addEventListener('DOMContentLoaded', initApp);
