let tg = window.Telegram.WebApp;
tg.expand();

const STORAGE_KEY = 'vpn_';

// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ =====
let coins = Number(localStorage.getItem(STORAGE_KEY + 'coins')) || 0;
let tapPower = Number(localStorage.getItem(STORAGE_KEY + 'tapPower')) || 1;
let totalTaps = Number(localStorage.getItem(STORAGE_KEY + 'totalTaps')) || 0;
let energy = Number(localStorage.getItem(STORAGE_KEY + 'energy')) || 100;
let maxEnergy = Number(localStorage.getItem(STORAGE_KEY + 'maxEnergy')) || 100;
let nickname = localStorage.getItem(STORAGE_KEY + 'nickname') || '';

// Бустеры
let critChance = Number(localStorage.getItem(STORAGE_KEY + 'critChance')) || 0;
let regenRate = Number(localStorage.getItem(STORAGE_KEY + 'regenRate')) || 1;

// Тема
let theme = localStorage.getItem(STORAGE_KEY + 'theme') || 'dark';

// Настройки
let settings = {
    soundTap: localStorage.getItem(STORAGE_KEY + 'soundTap') !== 'false',
    soundBuy: localStorage.getItem(STORAGE_KEY + 'soundBuy') !== 'false',
    vibration: localStorage.getItem(STORAGE_KEY + 'vibration') !== 'false'
};

// Задания (ПРОСТЫЕ)
let quests = [
    { id: 0, name: '💰 Заработай 100 монет', reward: 50, progress: 0, target: 100, completed: false },
    { id: 1, name: '👆 Сделай 500 тапов', reward: 'tap+0.01', progress: 0, target: 500, completed: false },
    { id: 2, name: '🔒 Купи первый VPN', reward: 200, progress: 0, target: 1, completed: false }
];

let savedQuests = localStorage.getItem(STORAGE_KEY + 'quests');
if (savedQuests) {
    quests = JSON.parse(savedQuests);
}

// Telegram данные
let user = tg.initDataUnsafe?.user;
let telegramName = user?.first_name || user?.username || 'Игрок';
let userId = user?.id || '123';

if (!nickname) {
    nickname = telegramName;
    localStorage.setItem(STORAGE_KEY + 'nickname', nickname);
}

// ===== DOM ЭЛЕМЕНТЫ =====
const coinBalance = document.getElementById('coinBalance');
const tapPowerEl = document.getElementById('tapPower');
const totalTapsEl = document.getElementById('totalTaps');
const energyCount = document.getElementById('energyCount');
const energyFill = document.getElementById('energyFill');
const tapCounter = document.getElementById('tapCounter');
const menuAvatar = document.getElementById('menuAvatar');
const menuNickname = document.getElementById('menuNickname');
const questsList = document.getElementById('questsList');
const profileAvatar = document.getElementById('profileAvatar');
const profileNickname = document.getElementById('profileNickname');
const profileId = document.getElementById('profileId');
const profileCoins = document.getElementById('profileCoins');
const profileTaps = document.getElementById('profileTaps');
const profilePower = document.getElementById('profilePower');
const questBadge = document.getElementById('questBadge');
const rewardModal = document.getElementById('rewardModal');
const rewardText = document.getElementById('rewardText');
const nicknameInput = document.getElementById('nicknameInput');
const toast = document.getElementById('toast');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const nicknameModal = document.getElementById('nicknameModal');
const themeToggle = document.getElementById('themeToggle');

// Элементы настроек
const soundTapCheck = document.getElementById('soundTap');
const soundBuyCheck = document.getElementById('soundBuy');
const vibrationCheck = document.getElementById('vibration');

// ===== ТЕМА =====
function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY + 'theme', theme);
    applyTheme();
}

function applyTheme() {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(theme + '-theme');
    if (themeToggle) {
        themeToggle.innerText = theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная';
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    loadSettings();
    applyTheme();
    updateUI();
    updateQuests();
    checkQuests();
    updateQuestBadge();
    setInterval(regenEnergy, 1000);
}

// ===== ОБНОВЛЕНИЕ UI =====
function updateUI() {
    coinBalance.innerText = coins.toFixed(2);
    tapPowerEl.innerText = (tapPower * 0.01).toFixed(2);
    totalTapsEl.innerText = totalTaps;
    energyCount.innerText = energy + '/' + maxEnergy;
    energyFill.style.width = (energy / maxEnergy * 100) + '%';

    let avatarChar = nickname.charAt(0).toUpperCase();
    menuAvatar.innerText = avatarChar;
    profileAvatar.innerText = avatarChar;
    menuNickname.innerText = nickname;
    profileNickname.innerText = nickname;
    profileId.innerText = userId;
    profileCoins.innerText = coins.toFixed(2);
    profileTaps.innerText = totalTaps;
    profilePower.innerText = (tapPower * 0.01).toFixed(2);

    localStorage.setItem(STORAGE_KEY + 'coins', coins);
    localStorage.setItem(STORAGE_KEY + 'tapPower', tapPower);
    localStorage.setItem(STORAGE_KEY + 'totalTaps', totalTaps);
    localStorage.setItem(STORAGE_KEY + 'energy', energy);
    localStorage.setItem(STORAGE_KEY + 'maxEnergy', maxEnergy);
    localStorage.setItem(STORAGE_KEY + 'nickname', nickname);
    localStorage.setItem(STORAGE_KEY + 'critChance', critChance);
    localStorage.setItem(STORAGE_KEY + 'regenRate', regenRate);
}

// ===== ЗАДАНИЯ =====
function updateQuests() {
    if (!questsList) return;

    let html = '';
    quests.forEach(quest => {
        let progressPercent = (quest.progress / quest.target * 100) + '%';
        let rewardText = typeof quest.reward === 'number' ? '🎁 ' + quest.reward + ' монет' : '🎁 ' + quest.reward;

        html += `
            <div class="quest-card">
                <div class="quest-icon">${quest.id === 0 ? '💰' : quest.id === 1 ? '👆' : '🔒'}</div>
                <div class="quest-info">
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-reward">${rewardText}</div>
                    <div class="quest-progress">
                        <div class="quest-progress-fill" style="width: ${progressPercent}"></div>
                    </div>
                </div>
                ${quest.completed ? '<button class="quest-btn" onclick="claimQuest(' + quest.id + ')">🎁 Забрать</button>' : ''}
            </div>
        `;
    });
    questsList.innerHTML = html;
}

function updateQuestProgress(type, value) {
    quests.forEach(quest => {
        if (!quest.completed) {
            if (type === 'coins' && quest.id === 0) quest.progress = Math.min(coins, quest.target);
            if (type === 'taps' && quest.id === 1) quest.progress = Math.min(totalTaps, quest.target);
            if (type === 'vpn' && quest.id === 2) quest.progress = Math.min(value, quest.target);

            if (quest.progress >= quest.target) {
                quest.completed = true;
            }
        }
    });
    localStorage.setItem(STORAGE_KEY + 'quests', JSON.stringify(quests));
    updateQuests();
    updateQuestBadge();
}

function updateQuestBadge() {
    let available = quests.filter(q => q.completed).length;
    if (questBadge) {
        questBadge.style.display = available > 0 ? 'flex' : 'none';
        questBadge.innerText = available;
    }
}

function claimQuest(id) {
    let quest = quests.find(q => q.id === id);
    if (!quest || !quest.completed) return;

    if (typeof quest.reward === 'number') {
        coins += quest.reward;
        showToast('🎁 +' + quest.reward + ' монет!');
    } else if (quest.reward === 'tap+0.01') {
        tapPower++;
        showToast('⚡ +0.01 к силе тапа!');
    }

    quest.completed = false;
    quest.progress = 0;

    localStorage.setItem(STORAGE_KEY + 'quests', JSON.stringify(quests));
    updateQuests();
    updateQuestBadge();
    updateUI();
}

function checkQuests() {
    updateQuestProgress('coins', coins);
    updateQuestProgress('taps', totalTaps);
}

// ===== ТАП =====
function handleTap() {
    if (energy <= 0) {
        showToast('⚡ Нет энергии');
        return;
    }

    document.querySelector('.clicker').style.transform = 'scale(0.95)';
    setTimeout(() => document.querySelector('.clicker').style.transform = '', 50);

    if (settings.vibration && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    let reward = 0.01 * tapPower;

    if (critChance > 0 && Math.random() * 100 < critChance) {
        reward *= 10;
        showToast('💥 КРИТ! x10');
    }

    energy--;
    coins += reward;
    totalTaps++;

    tapCounter.innerText = '+' + reward.toFixed(2);
    tapCounter.style.animation = 'none';
    tapCounter.offsetHeight;
    tapCounter.style.animation = 'floatUp 0.8s ease-out';

    updateUI();
    checkQuests();
}

// ===== ПОКУПКА БУСТЕРА =====
function buyBooster(type) {
    if (type === 'tap') {
        if (coins < 600) {
            showToast('❌ Недостаточно монет');
            return;
        }
        coins -= 600;
        tapPower++;
        showToast('✅ +0.01 за тап');
    }
    else if (type === 'energy') {
        if (coins < 500) {
            showToast('❌ Недостаточно монет');
            return;
        }
        coins -= 500;
        maxEnergy += 50;
        energy = maxEnergy;
        showToast('🔋 +50 энергии');
    }
    else if (type === 'crit') {
        if (coins < 1000) {
            showToast('❌ Недостаточно монет');
            return;
        }
        coins -= 1000;
        critChance += 5;
        showToast('💥 +5% крита');
    }

    updateUI();

    tg.sendData(JSON.stringify({
        action: 'buy_booster',
        type: type
    }));
}

// ===== ПОКУПКА VPN =====
function buyVPN(plan) {
    let price = plan === 'basic' ? 1000 : plan === 'pro' ? 2500 : 5000;

    if (coins < price) {
        showToast('❌ Недостаточно монет');
        return;
    }

    coins -= price;

    let key = 'VPN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    tg.sendData(JSON.stringify({
        action: 'buy_vpn',
        key: key,
        plan: plan,
        price: price
    }));

    updateQuestProgress('vpn', 1);
    showToast('✅ Ключ отправлен в бота!');
    updateUI();
}

// ===== РЕГЕНЕРАЦИЯ ЭНЕРГИИ =====
function regenEnergy() {
    if (energy < maxEnergy) {
        energy += regenRate;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
    }
}

// ===== НАСТРОЙКИ =====
function loadSettings() {
    if (soundTapCheck) soundTapCheck.checked = settings.soundTap;
    if (soundBuyCheck) soundBuyCheck.checked = settings.soundBuy;
    if (vibrationCheck) vibrationCheck.checked = settings.vibration;
}

function saveSetting(key, value) {
    settings[key] = value;
    localStorage.setItem(STORAGE_KEY + key, value);
}

// ===== МЕНЮ =====
function toggleMenu() {
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1)).classList.add('active');
    toggleMenu();

    if (pageId === 'quests') {
        updateQuests();
    }
}

// ===== НИКНЕЙМ =====
function showNicknameModal() {
    if (coins < 500) {
        showToast('❌ Нужно 500 монет');
        return;
    }
    nicknameModal.classList.add('active');
}

function closeModal() {
    nicknameModal.classList.remove('active');
    nicknameInput.value = '';
}

function changeNickname() {
    let newNick = nicknameInput.value.trim();
    if (!newNick || newNick.length < 3) {
        showToast('❌ Минимум 3 символа');
        return;
    }

    coins -= 500;
    nickname = newNick;
    localStorage.setItem(STORAGE_KEY + 'nickname', nickname);
    updateUI();

    tg.sendData(JSON.stringify({
        action: 'change_nickname',
        nickname: nickname
    }));

    closeModal();
    showToast('✅ Ник изменён');
}

// ===== НАГРАДЫ =====
function showReward(text) {
    rewardText.innerText = text;
    rewardModal.classList.add('active');
}

function closeRewardModal() {
    rewardModal.classList.remove('active');
}

// ===== ТОСТ =====
function showToast(text) {
    toast.innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', init);

// ===== ЭКСПОРТ =====
window.handleTap = handleTap;
window.buyBooster = buyBooster;
window.buyVPN = buyVPN;
window.toggleMenu = toggleMenu;
window.showPage = showPage;
window.showNicknameModal = showNicknameModal;
window.closeModal = closeModal;
window.changeNickname = changeNickname;
window.claimQuest = claimQuest;
window.saveSetting = saveSetting;
window.closeRewardModal = closeRewardModal;
window.toggleTheme = toggleTheme;