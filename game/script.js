// Game Configuration
const HANGUL_START = 44032;
const HANGUL_END = 55203;
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'rrh', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const JAMO_NAMES = {
    'ㄱ': '기역', 'ㄲ': '쌍기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄸ': '쌍디귿',
    'ㄹ': '리을', 'ㅁ': '미음', 'ㅂ': '비읍', 'ㅃ': '쌍비읍', 'ㅅ': '시옷',
    'ㅆ': '쌍시옷', 'ㅇ': '이응', 'ㅈ': '지읒', 'ㅉ': '쌍지읒', 'ㅊ': '치읓',
    'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗',
    'ㅏ': '아', 'ㅐ': '애', 'ㅑ': '야', 'ㅒ': '얘', 'ㅓ': '어',
    'ㅔ': '에', 'ㅕ': '여', 'ㅖ': '예', 'ㅗ': '오', 'ㅘ': '와',
    'ㅙ': '왜', 'ㅚ': '외', 'ㅛ': '요', 'ㅜ': '우', 'ㅝ': '워',
    'ㅞ': '웨', 'ㅟ': '위', 'ㅠ': '유', 'ㅡ': '으', 'ㅢ': '의',
    'ㅣ': '이',
    'ㄳ': '기역 시옷', 'ㄵ': '니은 지읒', 'ㄶ': '니은 히읗', 'ㄺ': '리을 기역',
    'ㄻ': '리을 미음', 'ㄼ': '리을 비읍', 'ls': '리을 시옷', 'ㄾ': '리을 티읕',
    'ㄿ': '리을 피읖', 'rrh': '리을 히읗', 'ㅄ': '비읍 시옷'
};

// State
let currentWordIndex = 0;
let currentWord = null;
let decomposedWord = [];
let currentSyllableIndex = 0;
let currentJamoPart = 0;
let score = 0;
let voices = [];
let selectedVoiceName = '';
let speechRate = 0.8;
let activeUtterance = null; // Global reference to prevent GC on iOS
const speechQueue = [];
let isSpeaking = false;
const SILENT_AUDIO = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

// Elements
const targetImageEl = document.getElementById('target-image');
const syllableContainerEl = document.getElementById('syllable-container');
const jamoOptionsEl = document.getElementById('jamo-options');
const kittyContainerEl = document.querySelector('.character-container');
const kittyEl = document.getElementById('kitty');
const scoreBoardEl = document.getElementById('score-board');
const overlayEl = document.getElementById('overlay');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn');
const startOverlayEl = document.getElementById('start-overlay');
const settingsBtn = document.getElementById('settings-btn');
const settingsModalEl = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const voiceSelect = document.getElementById('voice-select');
const speedRange = document.getElementById('speed-range');
const speedValueEl = document.getElementById('speed-value');
const testSpeechBtn = document.getElementById('test-speech-btn');

// Character Selection Elements
const charBtn = document.getElementById('char-btn');
const charModalEl = document.getElementById('char-modal');
const closeCharBtn = document.getElementById('close-char-btn');
const charCards = document.querySelectorAll('.char-card');

// --- Audio Engine ---
function log(msg) {
    console.log(msg);
}

function loadVoices() {
    if (!window.speechSynthesis) return;
    voices = window.speechSynthesis.getVoices();

    // Only show Korean voices in the selector
    const korVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('Ko'));

    voiceSelect.innerHTML = '';

    // Add Native voices first
    korVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
    });

    // Add Online Fallback as LAST option (it's often blocked by Google)
    const onlineOpt = document.createElement('option');
    onlineOpt.value = "online";
    onlineOpt.textContent = "🌐 온라인 백업 음성 (AI)";
    voiceSelect.appendChild(onlineOpt);

    // Default to a system voice if available or if current selection is "online" (to fix sudden silence)
    if (korVoices.length > 0) {
        if (!selectedVoiceName || selectedVoiceName === "online") {
            const pref = korVoices.find(v => v.name.includes('Google') || v.name.includes('Yuna') || v.name.includes('Sora'));
            selectedVoiceName = pref ? pref.name : korVoices[0].name;
            voiceSelect.value = selectedVoiceName;
        } else {
            voiceSelect.value = selectedVoiceName;
        }
    } else {
        voiceSelect.value = "online";
    }

    // Update UI if on start screen
    const instructions = document.getElementById('start-instructions');
    const icon = document.getElementById('start-icon');
    if (instructions && korVoices.length > 0 && instructions.dataset.loading === "true") {
        instructions.innerText = "준비 완료! 화면을 클릭하세요.";
        instructions.dataset.loading = "false";
        icon.innerText = "▶️";
    }
}

// Initial voice loader with polling for slow browsers
function initVoices() {
    if (!window.speechSynthesis) return;

    // Check every 250ms until voices are found
    const timer = setInterval(() => {
        const currentVoices = window.speechSynthesis.getVoices();
        if (currentVoices.length > 0) {
            loadVoices();
            clearInterval(timer);
        }
    }, 250);

    window.speechSynthesis.onvoiceschanged = loadVoices;
}
initVoices();

function speak(text) {
    if (!text) return;
    speechQueue.push(text);
    processQueue();
}

function processQueue() {
    if (isSpeaking || speechQueue.length === 0) return;

    isSpeaking = true;
    const text = speechQueue.shift();
    const spokenText = JAMO_NAMES[text] || text;

    // Try Native SpeechSynthesis
    if (window.speechSynthesis) {
        let voice = voices.find(v => v.name === voiceSelect.value);
        if (!voice && voiceSelect.value !== "online") {
            voice = voices.find(v => v.lang.includes('ko'));
        }

        if (voice) {
            window.speechSynthesis.cancel(); // Clear any hung states
            activeUtterance = new SpeechSynthesisUtterance(spokenText);
            activeUtterance.lang = 'ko-KR';
            activeUtterance.voice = voice;
            activeUtterance.rate = speechRate;
            activeUtterance.pitch = 1.0;

            activeUtterance.onend = () => {
                log(`Speech finished: ${text}`);
                activeUtterance = null;
                isSpeaking = false;
                nextBtn.style.opacity = "1";
                nextBtn.style.pointerEvents = "auto";
                setTimeout(processQueue, 100); // Small gap between words
            };

            activeUtterance.onerror = (e) => {
                console.error("Native speech error:", e);
                activeUtterance = null;
                isSpeaking = false;
                nextBtn.style.opacity = "1";
                nextBtn.style.pointerEvents = "auto";
                speakOnline(spokenText); // Final fallback
            };

            nextBtn.style.opacity = "0.5";
            nextBtn.style.pointerEvents = "none";
            window.speechSynthesis.speak(activeUtterance);
            window.speechSynthesis.resume();
            return;
        }
    }

    // Fallback or explicit Online
    speakOnline(spokenText);
}

function speakOnline(text) {
    try {
        log(`Trying online fallback for: ${text}`);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ko&client=tw-ob`;
        const audio = new Audio(url);
        audio.onended = () => {
            isSpeaking = false;
            nextBtn.style.opacity = "1";
            nextBtn.style.pointerEvents = "auto";
            setTimeout(processQueue, 100);
        };
        audio.onerror = (e) => {
            console.error(`온라인 음성 실패: ${e.message}`);
            isSpeaking = false;
            nextBtn.style.opacity = "1";
            nextBtn.style.pointerEvents = "auto";
            setTimeout(processQueue, 100);
        };
        nextBtn.style.opacity = "0.5";
        nextBtn.style.pointerEvents = "none";
        audio.play().catch(e => {
            console.error(`Audio play block: ${e.message}`);
            isSpeaking = false;
            nextBtn.style.opacity = "1";
            nextBtn.style.pointerEvents = "auto";
            setTimeout(processQueue, 100);
        });
    } catch (e) {
        console.error(`온라인 음성 오류: ${e.message}`);
        isSpeaking = false;
        setTimeout(processQueue, 100);
    }
}

// --- Logic Helpers ---
function decomposeSyllable(char) {
    const code = char.charCodeAt(0);
    if (code < HANGUL_START || code > HANGUL_END) return null;
    const offset = code - HANGUL_START;
    const c = Math.floor(offset / 588);
    const j = Math.floor((offset % 588) / 28);
    const jo = offset % 28;
    return {
        full: char,
        parts: [CHOSUNG[c], JUNGSUNG[j], JONGSUNG[jo]].filter(p => p !== '')
    };
}

function composeHangul(c, j, jo) {
    const ci = CHOSUNG.indexOf(c);
    const ji = JUNGSUNG.indexOf(j);
    const joi = JONGSUNG.indexOf(jo);
    if (ci === -1) return '';
    if (ji === -1) return c;
    const val = (joi !== -1) ? joi : 0;
    const code = HANGUL_START + (ci * 588) + (ji * 28) + val;
    return String.fromCharCode(code);
}

// --- Interaction ---
let lastX = 0;
let isMoving = false;
let moveTimeout = null;

function initInteraction() {
    document.addEventListener('mousemove', e => updateCharacterPos(e.clientX, e.clientY));
    document.addEventListener('touchmove', e => {
        updateCharacterPos(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    // Load saved character icon
    const savedChar = localStorage.getItem('selectedChar') || 'kitty';
    kittyEl.src = `assets/chars/${savedChar}.png`;
}

function updateCharacterPos(x, y) {
    kittyContainerEl.style.left = `${x}px`;
    kittyContainerEl.style.top = `${y}px`;
    const deltaX = x - lastX;
    if (Math.abs(deltaX) > 2) {
        kittyEl.style.transform = deltaX > 0 ? "scaleX(1)" : "scaleX(-1)";
    }
    lastX = x;
    if (!isMoving) {
        isMoving = true;
        kittyContainerEl.classList.add('walking');
    }
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
        isMoving = false;
        kittyContainerEl.classList.remove('walking');
    }, 100);

    // Custom collision detection for hover effects
    checkButtonCollision(x, y);
}

function checkButtonCollision(x, y) {
    const buttons = document.querySelectorAll('.jamo-btn');
    // We add a tiny offset so the center of the kitty acts as the pointer
    const pointerX = x;
    const pointerY = y;

    buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        // Check if pointer is inside button bounds
        if (pointerX >= rect.left && pointerX <= rect.right &&
            pointerY >= rect.top && pointerY <= rect.bottom) {
            btn.classList.add('character-hover');
        } else {
            btn.classList.remove('character-hover');
        }
    });
}

function setEmotion(e) {
    kittyContainerEl.classList.add(e);
    setTimeout(() => kittyContainerEl.classList.remove(e), 1200);
}

// --- Game Flow ---
function initGame() {
    score = 0;
    currentWordIndex = 0;
    WORDS.sort(() => Math.random() - 0.5);
    updateScore();
    loadLevel();
    initInteraction();
}

function loadLevel() {
    if (currentWordIndex >= WORDS.length) {
        currentWordIndex = 0;
        WORDS.sort(() => Math.random() - 0.5);
    }
    currentWord = WORDS[currentWordIndex];
    currentSyllableIndex = 0;
    currentJamoPart = 0;
    decomposedWord = currentWord.text.split('').map(decomposeSyllable);
    targetImageEl.textContent = currentWord.emoji;
    setTimeout(() => speak(currentWord.text), 500);
    renderSyllables();
    generateJamoOptions();
}

function renderSyllables() {
    syllableContainerEl.innerHTML = '';
    decomposedWord.forEach((s, idx) => {
        const box = document.createElement('div');
        box.classList.add('syllable-box');
        if (idx < currentSyllableIndex) {
            box.textContent = s.full;
            box.classList.add('completed', 'filled');
        } else if (idx === currentSyllableIndex) {
            box.classList.add('active', 'empty');
            const p = s.parts;
            let d = '';
            if (currentJamoPart === 1) d = p[0];
            else if (currentJamoPart === 2) d = composeHangul(p[0], p[1]);
            else if (currentJamoPart === 3) d = composeHangul(p[0], p[1], p[2]);
            box.textContent = d;
        } else {
            box.classList.add('empty');
        }
        syllableContainerEl.appendChild(box);
    });
}

function generateJamoOptions() {
    jamoOptionsEl.innerHTML = '';
    if (currentSyllableIndex >= decomposedWord.length) return;
    const s = decomposedWord[currentSyllableIndex];
    const target = s.parts[currentJamoPart];
    let pool = CHOSUNG;
    if (JUNGSUNG.includes(target)) pool = JUNGSUNG;
    else if (JONGSUNG.includes(target) && target !== '') pool = JONGSUNG.filter(x => x !== '');

    const set = new Set([target]);
    while (set.size < 5) set.add(pool[Math.floor(Math.random() * pool.length)]);
    const arr = Array.from(set).sort(() => Math.random() - 0.5);

    arr.forEach(j => {
        const btn = document.createElement('button');
        btn.classList.add('jamo-btn');
        btn.textContent = j;
        btn.onclick = () => handleJamoClick(j, btn);
        jamoOptionsEl.appendChild(btn);
    });
}

function handleJamoClick(j, btn) {
    if (currentSyllableIndex >= decomposedWord.length) return;
    const target = decomposedWord[currentSyllableIndex].parts[currentJamoPart];
    speak(j);
    if (j === target) {
        setEmotion('happy');
        btn.style.backgroundColor = '#C8E6C9';
        currentJamoPart++;
        if (currentJamoPart >= decomposedWord[currentSyllableIndex].parts.length) completeSyllable();
        else { renderSyllables(); setTimeout(generateJamoOptions, 300); }
    } else {
        btn.classList.add('wrong-shake');
        kittyContainerEl.classList.add('shake');
        setTimeout(() => { btn.classList.remove('wrong-shake'); kittyContainerEl.classList.remove('shake'); }, 500);
    }
}

function completeSyllable() {
    const s = decomposedWord[currentSyllableIndex];
    setTimeout(() => speak(s.full), 600);
    const box = syllableContainerEl.querySelectorAll('.syllable-box')[currentSyllableIndex];
    box.textContent = s.full;
    box.classList.remove('empty', 'active');
    box.classList.add('completed', 'celebrate');
    currentSyllableIndex++;
    currentJamoPart = 0;
    if (currentSyllableIndex >= decomposedWord.length) setTimeout(completeWord, 1000);
    else setTimeout(() => { renderSyllables(); generateJamoOptions(); }, 800);
}

function completeWord() {
    score++;
    updateScore();

    // Revised Success Sequence: Word -> Gong -> Praise
    speak(currentWord.text);
    setTimeout(() => {
        new Audio('https://www.soundjay.com/human/sounds/cheering-and-clapping-01.mp3').play().catch(() => { });
    }, 500);
    setTimeout(() => {
        speak("참 잘했어요!");
    }, 1500);

    overlayEl.querySelector('.message').textContent = `${currentWord.text}! 🎉`;
    overlayEl.classList.remove('hidden');
    targetImageEl.classList.add('celebrate');
    setTimeout(() => {
        overlayEl.classList.add('hidden');
        targetImageEl.classList.remove('celebrate');
        currentWordIndex++;
        loadLevel();
    }, 3000);
}

function updateScore() {
    scoreBoardEl.innerHTML = '⭐'.repeat(score);
}

// --- Events ---
resetBtn.onclick = initGame;
nextBtn.onclick = () => { speak("다음"); currentWordIndex++; loadLevel(); };
targetImageEl.onclick = () => { if (currentWord) speak(currentWord.text); };

// Character Selection Events
charBtn.onclick = () => charModalEl.classList.remove('hidden');
closeCharBtn.onclick = () => charModalEl.classList.add('hidden');
charCards.forEach(card => {
    card.onclick = () => {
        const charName = card.dataset.char;
        kittyEl.src = `assets/chars/${charName}.png`;
        localStorage.setItem('selectedChar', charName);
        charModalEl.classList.add('hidden');
    };
});

settingsBtn.onclick = () => settingsModalEl.classList.remove('hidden');
closeSettingsBtn.onclick = () => settingsModalEl.classList.add('hidden');
speedRange.oninput = () => {
    speechRate = parseFloat(speedRange.value);
    speedValueEl.textContent = speechRate.toFixed(1);
};
voiceSelect.onchange = () => { selectedVoiceName = voiceSelect.value; };
testSpeechBtn.onclick = () => speak("안녕하세요! 소리 테스트입니다.");

startOverlayEl.onclick = async () => {
    const instructions = document.getElementById('start-instructions');
    const icon = document.getElementById('start-icon');

    // Wait if voices aren't ready
    if (!voices.some(v => v.lang.includes('ko'))) {
        instructions.innerText = "목소리 준비 중... 잠시만 기다려주세요.";
        instructions.dataset.loading = "true";
        icon.innerText = "⏳";
        return;
    }

    startOverlayEl.classList.add('hidden');

    // Robust Unlock for iOS/Safari
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const unlock = new SpeechSynthesisUtterance("　"); // Zero-width space or quiet char
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);
    }

    // Unlock HTMLAudioElement
    const audio = new Audio(SILENT_AUDIO);
    audio.play().catch(() => { });

    initGame();
};
