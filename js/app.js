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
let exercises = {
    seated: [],
    standing: []
};
let currentMode = 'seated'; // 'seated' or 'standing'
let activeExercisesList = [];
let currentIndex = 0;
let isPlaying = false;
let isRestPhase = false;
let timerSeconds = 0;
let restDuration = 30; // Default rest duration in seconds
let intervalId = null;
let useSpeech = true;
let useGong = true;

// DOM Elements
const homeScreen = document.getElementById('screen-home');
const playerScreen = document.getElementById('screen-player');
const editorScreen = document.getElementById('screen-editor');

// Initialize App
function initApp() {
    loadExercises();
    setupEventListeners();
    updateHomeUI();
}

// Load from LocalStorage or default
function loadExercises() {
    const stored = localStorage.getItem('taichi_exercises_v1');
    if (stored) {
        try {
            exercises = JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored exercises, using defaults", e);
            resetToDefaults();
        }
    } else {
        resetToDefaults();
    }
    
    // Load setting options
    const speechSetting = localStorage.getItem('taichi_setting_speech');
    if (speechSetting !== null) useSpeech = speechSetting === 'true';
    const gongSetting = localStorage.getItem('taichi_setting_gong');
    if (gongSetting !== null) useGong = gongSetting === 'true';
    
    const storedRest = localStorage.getItem('taichi_setting_rest');
    if (storedRest !== null) restDuration = parseInt(storedRest, 10);
}

function resetToDefaults() {
    exercises.seated = JSON.parse(JSON.stringify(DEFAULT_SEATED));
    exercises.standing = JSON.parse(JSON.stringify(DEFAULT_STANDING));
    saveExercises();
}

function saveExercises() {
    localStorage.setItem('taichi_exercises_v1', JSON.stringify(exercises));
}

// Event Listeners
function setupEventListeners() {
    // Mode toggles
    document.getElementById('btn-mode-seated').addEventListener('click', () => setMode('seated'));
    document.getElementById('btn-mode-standing').addEventListener('click', () => setMode('standing'));

    // Main actions
    document.getElementById('btn-start-workout').addEventListener('click', startWorkout);
    document.getElementById('btn-manage-exercises').addEventListener('click', openEditor);
    
    // Editor controls
    document.getElementById('btn-editor-back').addEventListener('click', closeEditor);
    document.getElementById('btn-add-exercise').addEventListener('click', () => openExerciseModal());
    document.getElementById('btn-reset-exercises').addEventListener('click', () => {
        if(confirm("Voulez-vous vraiment restaurer les exercices d'origine ? Toutes vos modifications seront perdues.")) {
            resetToDefaults();
            renderEditorList();
            updateHomeUI();
        }
    });

    // Player controls
    document.getElementById('btn-player-play').addEventListener('click', togglePlay);
    document.getElementById('btn-player-skip').addEventListener('click', skipStep);
    document.getElementById('btn-player-back').addEventListener('click', stopWorkout);

    // Audio switches
    const switchSpeech = document.getElementById('switch-speech');
    switchSpeech.checked = useSpeech;
    switchSpeech.addEventListener('change', (e) => {
        useSpeech = e.target.checked;
        localStorage.setItem('taichi_setting_speech', useSpeech);
    });

    const switchGong = document.getElementById('switch-gong');
    switchGong.checked = useGong;
    switchGong.addEventListener('change', (e) => {
        useGong = e.target.checked;
        localStorage.setItem('taichi_setting_gong', useGong);
    });

    // Rest duration adjuster
    const btnRestMinus = document.getElementById('btn-rest-minus');
    const btnRestPlus = document.getElementById('btn-rest-plus');
    const labelRestValue = document.getElementById('lbl-rest-value');
    
    labelRestValue.textContent = restDuration + "s";
    btnRestMinus.addEventListener('click', () => {
        if (restDuration > 10) {
            restDuration -= 5;
            labelRestValue.textContent = restDuration + "s";
            localStorage.setItem('taichi_setting_rest', restDuration);
            updateHomeUI();
        }
    });
    btnRestPlus.addEventListener('click', () => {
        if (restDuration < 60) {
            restDuration += 5;
            labelRestValue.textContent = restDuration + "s";
            localStorage.setItem('taichi_setting_rest', restDuration);
            updateHomeUI();
        }
    });

    // Modal submit
    document.getElementById('form-exercise').addEventListener('submit', saveExerciseModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeExerciseModal);
}

// UI State Toggles
function setMode(mode) {
    currentMode = mode;
    document.getElementById('btn-mode-seated').classList.toggle('active', mode === 'seated');
    document.getElementById('btn-mode-standing').classList.toggle('active', mode === 'standing');
    updateHomeUI();
}

function calculateTotalDuration(list) {
    const totalSeconds = list.reduce((sum, item) => sum + item.duration, 0) + (list.length - 1) * restDuration;
    return totalSeconds;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} min ${s > 0 ? s + ' s' : ''}`;
}

function updateHomeUI() {
    activeExercisesList = exercises[currentMode];
    const totalSecs = calculateTotalDuration(activeExercisesList);
    
    // Display total time
    document.getElementById('lbl-total-time').textContent = formatTime(totalSecs);
    
    const warningEl = document.getElementById('warning-time-limit');
    if (totalSecs > 15 * 60) {
        warningEl.classList.remove('hidden');
        warningEl.textContent = "Attention : La séance dépasse 15 minutes (" + formatTime(totalSecs) + "). Désactivez ou réduisez certains exercices pour garder un rythme court.";
    } else {
        warningEl.classList.add('hidden');
    }

    // Display summary list
    const listContainer = document.getElementById('home-exercise-list');
    listContainer.innerHTML = '';
    
    if (activeExercisesList.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Aucun exercice actif. Ajoutez-en ou réinitialisez la liste.</p>';
        document.getElementById('btn-start-workout').disabled = true;
        return;
    }
    document.getElementById('btn-start-workout').disabled = false;

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
}

// Speak text using SpeechSynthesis
function speak(text) {
    if (!useSpeech) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Slightly slower for clear instruction
    window.speechSynthesis.speak(utterance);
}

// Workout Player Engine
function startWorkout() {
    if (activeExercisesList.length === 0) return;
    
    // Request Wake Lock if supported to keep screen alive
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(err => console.log('wakeLock error', err));
    }

    currentIndex = 0;
    isRestPhase = false;
    timerSeconds = activeExercisesList[currentIndex].duration;
    isPlaying = true;
    
    homeScreen.classList.add('hidden');
    playerScreen.classList.remove('hidden');
    
    document.getElementById('btn-player-play').innerHTML = '<span>⏸</span> Pause';

    updatePlayerUI();
    
    // Play initial gong and announce
    if (useGong) window.zenSounds.playGong();
    speak("Démarrage de la séance. Premier mouvement : " + activeExercisesList[currentIndex].name + ". Préparez-vous.");

    // Start timer interval
    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);
}

function stopWorkout() {
    clearInterval(intervalId);
    isPlaying = false;
    homeScreen.classList.remove('hidden');
    playerScreen.classList.add('hidden');
    window.speechSynthesis.cancel();
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('btn-player-play');
    if (isPlaying) {
        btn.innerHTML = '<span>⏸</span> Pause';
        btn.classList.remove('paused');
        intervalId = setInterval(tick, 1000);
        speak("Reprise");
    } else {
        btn.innerHTML = '<span>▶</span> Reprendre';
        btn.classList.add('paused');
        clearInterval(intervalId);
        speak("Pause");
    }
}

function tick() {
    if (!isPlaying) return;

    timerSeconds--;
    
    if (timerSeconds <= 0) {
        if (!isRestPhase) {
            // Finished exercise, move to rest or end
            if (currentIndex < activeExercisesList.length - 1) {
                isRestPhase = true;
                timerSeconds = restDuration;
                if (useGong) window.zenSounds.playBowl();
                const nextEx = activeExercisesList[currentIndex + 1].name;
                speak("Mouvement terminé. Relâchez. Prochain exercice dans " + restDuration + " secondes : " + nextEx);
            } else {
                // Workout complete
                clearInterval(intervalId);
                isRestPhase = false;
                isPlaying = false;
                if (useGong) window.zenSounds.playGong();
                speak("Félicitations, votre séance matinale de Tai Chi est terminée. Passez une excellente journée en pleine forme.");
                showFinishedScreen();
                return;
            }
        } else {
            // Finished rest phase, move to next exercise
            currentIndex++;
            isRestPhase = false;
            timerSeconds = activeExercisesList[currentIndex].duration;
            if (useGong) window.zenSounds.playGong();
            speak("Mouvement : " + activeExercisesList[currentIndex].name + ". C'est parti.");
        }
    }
    
    updatePlayerUI();
}

function skipStep() {
    if (!isRestPhase) {
        // Skip current exercise to rest
        if (currentIndex < activeExercisesList.length - 1) {
            isRestPhase = true;
            timerSeconds = restDuration;
            if (useGong) window.zenSounds.playBowl();
            const nextEx = activeExercisesList[currentIndex + 1].name;
            speak("Mouvement passé. Repos. Prochain exercice : " + nextEx);
        } else {
            // End workout
            timerSeconds = 0;
            tick();
        }
    } else {
        // Skip rest to next exercise
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

    // Breathing instruction & breathing animation control
    if (isRestPhase) {
        phaseEl.textContent = "PAUSE RESPIRATOIRE";
        phaseEl.className = "phase-badge rest";
        titleEl.textContent = "Respirer & Relâcher";
        descEl.textContent = "Détendez les bras, gardez le dos droit et inspirez profondément par le nez, expirez lentement par la bouche.";
        postureEl.textContent = "Posture : Corps détendu, épaules basses.";
        
        // Dynamic next preview
        const nextEx = activeExercisesList[currentIndex + 1];
        nextPreviewEl.textContent = "Suivant : " + nextEx.name;
        nextPreviewEl.classList.remove('hidden');
        
        // Breathe rate for rest is slightly slower
        breathingGuide.className = "breathing-circle breathing-active-slow";
        document.getElementById('breathing-txt').textContent = "Calmer le souffle";
    } else {
        phaseEl.textContent = `EXERCICE ${currentIndex + 1} / ${activeExercisesList.length}`;
        phaseEl.className = "phase-badge active-workout";
        titleEl.textContent = ex.name;
        descEl.textContent = ex.desc;
        postureEl.textContent = "Attention : " + ex.posture;
        nextPreviewEl.classList.add('hidden');
        
        // Active exercise breathing speed
        breathingGuide.className = "breathing-circle breathing-active-normal";
        document.getElementById('breathing-txt').textContent = "Suivre le rythme";
    }

    // Format remaining time
    const min = Math.floor(timerSeconds / 60);
    const sec = timerSeconds % 60;
    timerValueEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    // Circular progress
    const maxTime = isRestPhase ? restDuration : ex.duration;
    const progressPercent = ((maxTime - timerSeconds) / maxTime) * 100;
    // Stroke-dasharray for svg circle is 565.48 (2 * PI * 90)
    const dashOffset = 565.48 - (565.48 * progressPercent) / 100;
    circleProgress.style.strokeDashoffset = dashOffset;

    // Overall session progress bar
    const overallProgress = document.getElementById('player-overall-progress');
    const totalSteps = activeExercisesList.length * 2 - 1; // including rests
    const currentStep = currentIndex * 2 + (isRestPhase ? 1 : 0);
    const progressWidth = (currentStep / totalSteps) * 100;
    overallProgress.style.width = `${progressWidth}%`;
    progressTextEl.textContent = `Progression globale : ${Math.round(progressWidth)}%`;
}

function showFinishedScreen() {
    clearInterval(intervalId);
    
    const container = document.getElementById('player-workout-container');
    const oldHTML = container.innerHTML;
    
    container.innerHTML = `
        <div class="finished-view animate-fade-in">
            <div class="finished-badge">☯</div>
            <h2>Routine Terminée !</h2>
            <p>Excellent travail. Vous venez de fortifier votre corps et de calmer votre esprit pour la journée.</p>
            <div class="finished-summary">
                <div><strong>Routine :</strong> ${currentMode === 'seated' ? 'Assise (Chaise)' : 'Debout'}</div>
                <div><strong>Temps pratiqué :</strong> ${formatTime(calculateTotalDuration(activeExercisesList))}</div>
            </div>
            <button id="btn-finished-close" class="btn btn-primary btn-large">Retour à l'accueil</button>
        </div>
    `;

    document.getElementById('btn-finished-close').addEventListener('click', () => {
        container.innerHTML = oldHTML; // restore template
        // rebind buttons
        document.getElementById('btn-player-play').addEventListener('click', togglePlay);
        document.getElementById('btn-player-skip').addEventListener('click', skipStep);
        document.getElementById('btn-player-back').addEventListener('click', stopWorkout);
        stopWorkout();
    });
}

// Workout Editor UI
function openEditor() {
    homeScreen.classList.add('hidden');
    editorScreen.classList.remove('hidden');
    renderEditorList();
}

function closeEditor() {
    homeScreen.classList.remove('hidden');
    editorScreen.classList.add('hidden');
    updateHomeUI();
}

function renderEditorList() {
    const list = exercises[currentMode];
    const container = document.getElementById('editor-exercises-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-msg">Aucun exercice pour cette routine. Cliquez sur Ajouter.</p>';
        return;
    }

    list.forEach((ex, index) => {
        const item = document.createElement('div');
        item.className = 'editor-exercise-item';
        item.innerHTML = `
            <div class="ex-info">
                <h4>${ex.name} (${ex.duration}s)</h4>
                <p>${ex.desc.substring(0, 70)}${ex.desc.length > 70 ? '...' : ''}</p>
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

// Edit & Delete Window exports
window.editExerciseItem = function(id) {
    const list = exercises[currentMode];
    const ex = list.find(item => item.id === id);
    if (ex) {
        openExerciseModal(ex);
    }
};

window.deleteExerciseItem = function(id) {
    if (confirm("Supprimer cet exercice de la routine ?")) {
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
    
    // Swap items
    const temp = list[idx];
    list[idx] = list[newIdx];
    list[newIdx] = temp;
    
    saveExercises();
    renderEditorList();
};

// Exercise Modal Add / Edit
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
        alert("Veuillez renseigner un nom et une durée valide.");
        return;
    }
    
    const list = exercises[currentMode];
    
    if (editingId) {
        // Edit mode
        const idx = list.findIndex(item => item.id === editingId);
        if (idx !== -1) {
            list[idx].name = name;
            list[idx].duration = duration;
            list[idx].desc = desc;
            list[idx].posture = posture;
        }
    } else {
        // Add mode
        const newEx = {
            id: 'custom_' + Date.now(),
            name,
            duration,
            desc: desc || "Mouvement de Tai Chi personnalisé.",
            posture: posture || "Gardez le dos aligné et respirez calmement."
        };
        list.push(newEx);
    }
    
    saveExercises();
    closeExerciseModal();
    renderEditorList();
}

// Start up when loaded
window.addEventListener('DOMContentLoaded', initApp);
