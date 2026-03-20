:root {
    --bg-color: #FFF9C4;
    --primary-color: #FFB7B2;
    --accent-color: #FF6F91;
    --text-color: #4A4A4A;
    --white: #FFFFFF;
    --jamo-bg: #E1F5FE;
    --success-color: #C8E6C9;
}

* {
    box-sizing: border-box;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

body {
    margin: 0;
    padding: 0;
    font-family: 'Jua', 'Nanum Pen Script', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow: hidden;
    height: 100vh;
    height: 100dvh;
    /* Mobile viewport fix */
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
}

@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');

body {
    font-family: 'Jua', sans-serif;
}

#game-container {
    width: 100%;
    height: 100%;
    height: 100dvh;
    /* Mobile viewport fix */
    max-width: 800px;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* Header */
.game-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10vh;
    z-index: 20;
}

.controls {
    display: flex;
    gap: 15px;
}

#score-board {
    font-size: 2rem;
    color: #FFD54F;
    display: flex;
    gap: 5px;
}

.icon-btn {
    background: white;
    border: 2px solid #EEE;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s;
}

.icon-btn:active {
    transform: scale(0.9);
}

/* Main Stage */
.game-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
}

.question-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    z-index: 5;
}

.target-image {
    font-size: 13rem;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.target-image:hover {
    transform: scale(1.1);
}

.syllable-container {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.syllable-box {
    width: 90px;
    height: 90px;
    background-color: var(--white);
    border: 4px solid var(--primary-color);
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3.5rem;
    box-shadow: 0 6px 0 var(--accent-color);
    position: relative;
    transition: all 0.3s;
}

.syllable-box.empty {
    border-style: dashed;
    background-color: rgba(255, 255, 255, 0.5);
    color: transparent;
}

.syllable-box.active {
    border-color: #29B6F6;
    transform: scale(1.05);
    background-color: #E1F5FE;
    color: #0277BD;
}

.syllable-box.filled {
    color: var(--text-color);
    background-color: var(--white);
}

.syllable-box.completed {
    background-color: var(--success-color);
    border-color: #81C784;
    box-shadow: 0 4px 0 #66BB6A;
}

/* Footer (Inputs) */
.choice-area {
    height: 25vh;
    background-color: rgba(255, 255, 255, 0.6);
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 20;
}

.jamo-options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    width: 100%;
}

.jamo-btn {
    width: 85px;
    height: 85px;
    background: linear-gradient(135deg, #E1F5FE, #B3E5FC);
    border: none;
    border-bottom: 6px solid #4FC3F7;
    border-radius: 25px;
    font-size: 2.8rem;
    font-weight: bold;
    font-family: 'Jua', sans-serif;
    color: #01579B;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.1s;
    position: relative;
    top: 0;
}

.jamo-btn:active {
    top: 4px;
    border-bottom-width: 2px;
}

.jamo-btn.wrong-shake {
    animation: wrongShake 0.5s;
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    border-bottom-color: #E57373;
    color: #C62828;
}

/* Character CSS Drawing */
.character-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    z-index: 10;
    pointer-events: none;
    transition: transform 0.1s linear;
    will-change: transform, left, top;
}

.character-container.walking .kitty {
    animation: walk-bob 0.4s infinite alternate;
}

.kitty {
    width: 100%;
    height: 100%;
    position: relative;
}

.kitty-head {
    width: 60px;
    height: 50px;
    background: #fff;
    border-radius: 50% 50% 40% 40%;
    border: 3px solid #333;
    position: relative;
    z-index: 2;
    margin: 0 auto;
}

.kitty-ear {
    width: 18px;
    height: 18px;
    background: #fff;
    border: 3px solid #333;
    border-radius: 20% 80% 0 0;
    position: absolute;
    top: -10px;
    z-index: 1;
}

.kitty-ear.left {
    left: 5px;
    transform: rotate(-15deg);
}

.kitty-ear.right {
    right: 5px;
    transform: rotate(15deg);
}

.kitty-face {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
}

.kitty-eye {
    width: 5px;
    height: 8px;
    background: #333;
    border-radius: 50%;
    position: absolute;
    top: 18px;
    animation: blink 4s infinite;
}

.kitty-eye.left {
    left: 14px;
}

.kitty-eye.right {
    right: 14px;
}

/* Emotion: Happy Eyes */
.character-container.happy .kitty-eye {
    width: 10px;
    height: 5px;
    background: transparent;
    border: 2px solid #333;
    border-bottom: 0;
    border-radius: 10px 10px 0 0;
    /* Inverted U */
    transform: none;
    top: 18px;
    animation: none;
}

.character-container.happy .kitty-eye.left {
    left: 10px;
}

.character-container.happy .kitty-eye.right {
    right: 10px;
}


.kitty-nose {
    width: 8px;
    height: 5px;
    background: #FFD600;
    border-radius: 50%;
    position: absolute;
    top: 26px;
    left: 50%;
    transform: translateX(-50%);
}

.kitty-mouth {
    width: 10px;
    height: 5px;
    border-radius: 0 0 50% 50%;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    transition: all 0.2s;
}

.character-container.happy .kitty-mouth {
    width: 18px;
    height: 10px;
    border: 2px solid #333;
    border-top: none;
    background: #FF8A80;
    border-radius: 0 0 20px 20px;
    top: 28px;
    border-color: #333;
}

.kitty-whiskers {
    width: 18px;
    height: 2px;
    background: #333;
    position: absolute;
    top: 28px;
}

.kitty-whiskers.left {
    left: -4px;
    transform: rotate(15deg);
}

.kitty-whiskers.left::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 2px;
    background: #333;
    top: 6px;
    transform: rotate(-15deg);
}

.kitty-whiskers.right {
    right: -4px;
    transform: rotate(-15deg);
}

.kitty-whiskers.right::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 2px;
    background: #333;
    top: 6px;
    transform: rotate(15deg);
}

.kitty-bow {
    width: 16px;
    height: 10px;
    background: #FF6F91;
    position: absolute;
    top: -2px;
    right: 10px;
    border-radius: 5px;
    border: 2px solid #333;
    z-index: 3;
}

.kitty-body {
    width: 36px;
    height: 30px;
    background: #FFB7B2;
    border: 3px solid #333;
    border-radius: 12px 12px 8px 8px;
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}

.kitty-legs {
    position: absolute;
    bottom: -5px;
    width: 100%;
    height: 10px;
    z-index: 0;
}

.kitty-leg {
    width: 8px;
    height: 12px;
    background: #fff;
    border: 2px solid #333;
    border-radius: 0 0 5px 5px;
    position: absolute;
    bottom: 0;
}

.kitty-leg.left {
    left: calc(50% - 10px);
}

.kitty-leg.right {
    left: calc(50% + 2px);
}

.character-container.walking .kitty-leg.left {
    animation: leg-move 0.4s infinite alternate;
}

.character-container.walking .kitty-leg.right {
    animation: leg-move 0.4s infinite alternate-reverse;
}

@keyframes leg-move {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-3px);
    }
}

@keyframes walk-bob {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-5px);
    }
}

@keyframes blink {

    0%,
    96%,
    98% {
        height: 8px;
    }

    97% {
        height: 1px;
    }
}

@keyframes wrongShake {
    0% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-8px) rotate(-5deg);
    }

    40% {
        transform: translateX(8px) rotate(5deg);
    }

    60% {
        transform: translateX(-8px) rotate(-5deg);
    }

    80% {
        transform: translateX(8px) rotate(5deg);
    }

    100% {
        transform: translateX(0);
    }
}

.shake {
    animation: wrongShake 0.5s;
}

@keyframes celebrate {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2) rotate(10deg);
    }

    100% {
        transform: scale(1) rotate(0);
    }
}

.celebrate {
    animation: celebrate 0.5s;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    transition: opacity 0.3s;
}

.overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.message {
    font-size: 3rem;
    color: var(--accent-color);
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 90%;
}

/* Settings Specifically */
.settings-content {
    color: #4A4A4A;
    text-align: left;
    width: 350px;
}

.setting-item label {
    font-family: 'Jua', sans-serif;
    color: var(--text-color);
}

@keyframes popIn {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Mobile Optimizations */
@media (max-width: 600px) {
    .target-image {
        font-size: 8rem;
        margin-bottom: 20px;
    }

    .syllable-box {
        width: 60px;
        height: 60px;
        font-size: 2rem;
    }

    .choice-area {
        height: auto;
        min-height: 25vh;
        padding: 20px 10px;
        align-items: flex-start;
    }

    .jamo-options {
        gap: 10px;
    }

    .jamo-btn {
        width: 15vw;
        height: 15vw;
        max-width: 65px;
        max-height: 65px;
        font-size: 1.8rem;
        border-radius: 15px;
    }

    .game-header {
        padding: 10px 20px;
        height: 8vh;
    }
}const WORDS = [
    // Animals (25)
    { text: "강아지", emoji: "🐶" }, { text: "고양이", emoji: "🐱" }, { text: "병아리", emoji: "🐤" }, { text: "호랑이", emoji: "🐯" }, { text: "얼룩말", emoji: "🦓" },
    { text: "코끼리", emoji: "🐘" }, { text: "기린", emoji: "🦒" }, { text: "원숭이", emoji: "🐵" }, { text: "토끼", emoji: "🐰" }, { text: "다람쥐", emoji: "🐿️" },
    { text: "사자", emoji: "🦁" }, { text: "판다", emoji: "🐼" }, { text: "돼지", emoji: "🐷" }, { text: "오리", emoji: "🦆" }, { text: "펭귄", emoji: "🐧" },
    { text: "거북이", emoji: "🐢" }, { text: "개구리", emoji: "🐸" }, { text: "나비", emoji: "🦋" }, { text: "꿀벌", emoji: "🐝" }, { text: "무당벌레", emoji: "🐞" },
    { text: "고래", emoji: "🐳" }, { text: "돌고래", emoji: "🐬" }, { text: "상어", emoji: "🦈" }, { text: "문어", emoji: "🐙" }, { text: "물고기", emoji: "🐟" },

    // Fruits & Food (25)
    { text: "사과", emoji: "🍎" }, { text: "바나나", emoji: "🍌" }, { text: "포도", emoji: "🍇" }, { text: "수박", emoji: "🍉" }, { text: "딸기", emoji: "🍓" },
    { text: "복숭아", emoji: "🍑" }, { text: "파인애플", emoji: "🍍" }, { text: "토마토", emoji: "🍅" }, { text: "당근", emoji: "🥕" }, { text: "옥수수", emoji: "🌽" },
    { text: "오렌지", emoji: "🍊" }, { text: "레몬", emoji: "🍋" }, { text: "버섯", emoji: "🍄" }, { text: "브로콜리", emoji: "🥦" }, { text: "감자", emoji: "🥔" },
    { text: "빵", emoji: "🍞" }, { text: "우유", emoji: "🥛" }, { text: "케이크", emoji: "🍰" }, { text: "아이스크림", emoji: "🍦" }, { text: "사탕", emoji: "🍬" },
    { text: "초콜릿", emoji: "🍫" }, { text: "쿠키", emoji: "🍪" }, { text: "햄버거", emoji: "🍔" }, { text: "피자", emoji: "🍕" }, { text: "치즈", emoji: "🧀" },

    // Vehicles (15)
    { text: "자동차", emoji: "🚗" }, { text: "버스", emoji: "🚌" }, { text: "택시", emoji: "🚕" }, { text: "경찰차", emoji: "🚓" }, { text: "소방차", emoji: "🚒" },
    { text: "구급차", emoji: "🚑" }, { text: "기차", emoji: "🚂" }, { text: "비행기", emoji: "✈️" }, { text: "자전거", emoji: "🚲" }, { text: "오토바이", emoji: "🏍️" },
    { text: "배", emoji: "🚢" }, { text: "트럭", emoji: "🚚" }, { text: "헬리콥터", emoji: "🚁" }, { text: "로켓", emoji: "🚀" }, { text: "지하철", emoji: "🚇" },

    // Objects & Toys (20)
    { text: "공", emoji: "⚽" }, { text: "풍선", emoji: "🎈" }, { text: "인형", emoji: "🧸" }, { text: "선물", emoji: "🎁" }, { text: "로봇", emoji: "🤖" },
    { text: "우산", emoji: "☂️" }, { text: "모자", emoji: "🧢" }, { text: "안경", emoji: "👓" }, { text: "시계", emoji: "⏰" }, { text: "책", emoji: "📖" },
    { text: "연필", emoji: "✏️" }, { text: "가방", emoji: "🎒" }, { text: "신발", emoji: "👟" }, { text: "양말", emoji: "🧦" }, { text: "전화기", emoji: "☎️" },
    { text: "카메라", emoji: "📷" }, { text: "피아노", emoji: "🎹" }, { text: "기타", emoji: "🎸" }, { text: "드럼", emoji: "🥁" }, { text: "마이크", emoji: "🎤" },

    // Nature & Others (15)
    { text: "해", emoji: "☀️" }, { text: "달", emoji: "🌙" }, { text: "별", emoji: "⭐" }, { text: "구름", emoji: "☁️" }, { text: "비", emoji: "☔" },
    { text: "눈", emoji: "☃️" }, { text: "나무", emoji: "🌳" }, { text: "꽃", emoji: "🌷" }, { text: "선인장", emoji: "🌵" }, { text: "무지개", emoji: "🌈" },
    { text: "집", emoji: "🏠" }, { text: "학교", emoji: "🏫" }, { text: "병원", emoji: "🏥" }, { text: "약국", emoji: "💊" }, { text: "선풍기", emoji: "🌀" }
];
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

    // Add Online Fallback as first option
    const onlineOpt = document.createElement('option');
    onlineOpt.value = "online";
    onlineOpt.textContent = "🌐 온라인 인공지능 (기본)";
    voiceSelect.appendChild(onlineOpt);

    korVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
    });

    // Default to a system voice if available to save bandwidth/API
    if (korVoices.length > 0 && !selectedVoiceName) {
        // Preference for "Yu-na" or "Sora"
        const pref = korVoices.find(v => v.name.includes('Yuna') || v.name.includes('Sora'));
        selectedVoiceName = pref ? pref.name : korVoices[0].name;
        voiceSelect.value = selectedVoiceName;
    } else if (selectedVoiceName) {
        voiceSelect.value = selectedVoiceName;
    }
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    setInterval(() => { if (voices.length === 0) loadVoices(); }, 1000);
}
loadVoices();

function speak(text) {
    if (!text) return;
    const spokenText = JAMO_NAMES[text] || text;

    if (voiceSelect.value !== "online" && window.speechSynthesis) {
        const voice = voices.find(v => v.name === voiceSelect.value);
        if (voice) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(spokenText);
            utterance.lang = 'ko-KR';
            utterance.voice = voice;
            utterance.rate = speechRate;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
            window.speechSynthesis.resume();
            return;
        }
    }

    // Fallback or explicit Online
    speakOnline(spokenText);
}

function speakOnline(text) {
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ko&client=tw-ob`;
        const audio = new Audio(url);
        audio.play().catch(e => console.error(`온라인 음성 실패: ${e.message}`));
    } catch (e) {
        console.error(`온라인 음성 오류: ${e.message}`);
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
    speak("참 잘했어요! " + currentWord.text);
    new Audio('https://www.soundjay.com/human/sounds/cheering-and-clapping-01.mp3').play().catch(() => { });
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
settingsBtn.onclick = () => settingsModalEl.classList.remove('hidden');
closeSettingsBtn.onclick = () => settingsModalEl.classList.add('hidden');
speedRange.oninput = () => {
    speechRate = parseFloat(speedRange.value);
    speedValueEl.textContent = speechRate.toFixed(1);
};
voiceSelect.onchange = () => { selectedVoiceName = voiceSelect.value; };

startOverlayEl.onclick = () => {
    startOverlayEl.classList.add('hidden');
    window.speechSynthesis.resume();
    if (voices.length === 0) loadVoices();
    speak('');
    initGame();
};
