let tg = window.Telegram.WebApp;
tg.expand();

const STORAGE_KEY = 'vpn_';

// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ =====
let coins = Number(localStorage.getItem(STORAGE_KEY + 'coins')) || 0;
let tapPower = Number(localStorage.getItem(STORAGE_KEY + 'tapPower')) || 1;
let totalTaps = Number(localStorage.getItem(STORAGE_KEY + 'totalTaps')) || 0;
let energy = Number(localStorage.getItem(STORAGE_KEY + 'energy')) || 300;
let maxEnergy = Number(localStorage.getItem(STORAGE_KEY + 'maxEnergy')) || 300;
let nickname = localStorage.getItem(STORAGE_KEY + 'nickname') || '';

// ===== УЛУЧШЕНИЯ =====
let tapLevel = Number(localStorage.getItem(STORAGE_KEY + 'tapLevel')) || 1;
let energyLevel = Number(localStorage.getItem(STORAGE_KEY + 'energyLevel')) || 1;
let regenLevel = Number(localStorage.getItem(STORAGE_KEY + 'regenLevel')) || 1;
let regenRate = Number(localStorage.getItem(STORAGE_KEY + 'regenRate')) || 1;

// ===== БУСТЕРЫ =====
let critChance = Number(localStorage.getItem(STORAGE_KEY + 'critChance')) || 0;

// ===== ТАЙМЕРЫ =====
let lastDaily = Number(localStorage.getItem(STORAGE_KEY + 'lastDaily')) || 0;
let lastWheel = Number(localStorage.getItem(STORAGE_KEY + 'lastWheel')) || 0;

// ===== ЗАДАНИЯ =====
let quests = [
    { id: 0, name: '💰 Заработай 50 монет', reward: 20, progress: 0, target: 50, claimed: false },
    { id: 1, name: '💰 Заработай 100 монет', reward: 50, progress: 0, target: 100, claimed: false },
    { id: 2, name: '💰 Заработай 500 монет', reward: 200, progress: 0, target: 500, claimed: false },
    { id: 3, name: '👆 Сделай 100 тапов', reward: 30, progress: 0, target: 100, claimed: false },
    { id: 4, name: '👆 Сделай 500 тапов', reward: 100, progress: 0, target: 500, claimed: false },
    { id: 5, name: '👆 Сделай 2000 тапов', reward: 300, progress: 0, target: 2000, claimed: false },
    { id: 6, name: '🔒 Купи базовый VPN', reward: 100, progress: 0, target: 1, claimed: false },
    { id: 7, name: '🔒 Купи PRO VPN', reward: 200, progress: 0, target: 1, claimed: false },
    { id: 8, name: '⚡ Улучши силу тапа 5 раз', reward: 150, progress: 0, target: 5, claimed: false },
    { id: 9, name: '🔋 Улучши энергию 5 раз', reward: 150, progress: 0, target: 5, claimed: false }
];

let savedQuests = localStorage.getItem(STORAGE_KEY + 'quests');
if (savedQuests) {
    quests = JSON.parse(savedQuests);
}

// ===== Telegram данные =====
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
const menuNickname = document.getElementById('menuNickname');
const menuAvatar = document.getElementById('menuAvatar');
const profileNickname = document.getElementById('profileNickname');
const profileAvatar = document.getElementById('profileAvatar');
const profileId = document.getElementById('profileId');
const profileCoins = document.getElementById('profileCoins');
const profileTaps = document.getElementById('profileTaps');
const profilePower = document.getElementById('profilePower');
const questsList = document.getElementById('questsList');
const questBadge = document.getElementById('questBadge');
const nicknameInput = document.getElementById('nicknameInput');
const toast = document.getElementById('toast');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const nicknameModal = document.getElementById('nicknameModal');
const headerNickname = document.getElementById('headerNickname');
const headerAvatar = document.getElementById('headerAvatar');
const wheelPreviewBtn = document.getElementById('wheelPreviewBtn');
const wheelTimerPreview = document.getElementById('wheelTimerPreview');

// Элементы улучшений
const tapLevelEl = document.getElementById('tapLevel');
const tapPriceEl = document.getElementById('tapPrice');
const energyLevelEl = document.getElementById('energyLevel');
const energyPriceEl = document.getElementById('energyPrice');
const regenLevelEl = document.getElementById('regenLevel');
const regenPriceEl = document.getElementById('regenPrice');

// Элементы магазина
const dailyStatus = document.getElementById('dailyStatus');
const dailyTimer = document.getElementById('dailyTimer');
const dailyBtn = document.getElementById('dailyBtn');
const wheelStatus = document.getElementById('wheelStatus');
const wheelTimer = document.getElementById('wheelTimer');
const wheelBtn = document.getElementById('wheelBtn');
const wheel = document.getElementById('wheel');
const shopBadge = document.getElementById('shopBadge');

// Элементы настроек
const themeToggle = document.getElementById('themeToggle');
const soundTapCheck = document.getElementById('soundTap');
const vibrationCheck = document.getElementById('vibration');

// ===== ТЕМА =====
let theme = localStorage.getItem(STORAGE_KEY + 'theme') || 'dark';

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

// ===== НАСТРОЙКИ =====
let settings = {
    soundTap: localStorage.getItem(STORAGE_KEY + 'soundTap') !== 'false',
    vibration: localStorage.getItem(STORAGE_KEY + 'vibration') !== 'false'
};

function loadSettings() {
    if (soundTapCheck) soundTapCheck.checked = settings.soundTap;
    if (vibrationCheck) vibrationCheck.checked = settings.vibration;
}

function saveSetting(key, value) {
    settings[key] = value;
    localStorage.setItem(STORAGE_KEY + key, value);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    loadSettings();
    applyTheme();
    updateUI();
    updateQuests();
    updateQuestBadge();
    updateUpgradesUI();
    updateTimers();
    setInterval(regenEnergy, 1000);
    setInterval(updateTimers, 1000);

    // Показать модалку ника при первом входе
    if (!localStorage.getItem(STORAGE_KEY + 'nickname')) {
        setTimeout(() => {
            showFirstNicknameModal();
        }, 500);
    }
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

    // Обновление ника в шапке
    if (headerNickname) headerNickname.innerText = nickname;
    if (headerAvatar) headerAvatar.innerText = avatarChar;

    localStorage.setItem(STORAGE_KEY + 'coins', coins);
    localStorage.setItem(STORAGE_KEY + 'tapPower', tapPower);
    localStorage.setItem(STORAGE_KEY + 'totalTaps', totalTaps);
    localStorage.setItem(STORAGE_KEY + 'energy', energy);
    localStorage.setItem(STORAGE_KEY + 'maxEnergy', maxEnergy);
    localStorage.setItem(STORAGE_KEY + 'nickname', nickname);
    localStorage.setItem(STORAGE_KEY + 'critChance', critChance);
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

// ===== УЛУЧШЕНИЯ =====
function updateUpgradesUI() {
    if (tapLevelEl) tapLevelEl.innerText = 'Ур. ' + tapLevel;
    if (tapPriceEl) tapPriceEl.innerText = (tapLevel * 10) + ' 🪙';

    if (energyLevelEl) energyLevelEl.innerText = 'Ур. ' + energyLevel;
    if (energyPriceEl) energyPriceEl.innerText = (energyLevel * 15) + ' 🪙';

    if (regenLevelEl) regenLevelEl.innerText = 'Ур. ' + regenLevel;
    if (regenPriceEl) regenPriceEl.innerText = (regenLevel * 20) + ' 🪙';
}

function buyTapUpgrade() {
    let price = tapLevel * 10;
    if (coins < price) {
        showToast('❌ Недостаточно монет');
        return;
    }

    coins -= price;
    tapPower++;
    tapLevel++;

    updateUI();
    updateUpgradesUI();
    showToast('✅ +0.01 к силе тапа');
}

function buyEnergyUpgrade() {
    let price = energyLevel * 15;
    if (coins < price) {
        showToast('❌ Недостаточно монет');
        return;
    }

    coins -= price;
    maxEnergy += 200;
    energy = maxEnergy;
    energyLevel++;

    updateUI();
    updateUpgradesUI();
    showToast('🔋 +200 энергии');
}

function buyRegenUpgrade() {
    let price = regenLevel * 20;
    if (coins < price) {
        showToast('❌ Недостаточно монет');
        return;
    }

    coins -= price;
    regenRate++;
    regenLevel++;

    localStorage.setItem(STORAGE_KEY + 'regenRate', regenRate);
    updateUI();
    updateUpgradesUI();
    showToast('🔄 +1 энергии/сек');
}

// ===== ЗАДАНИЯ =====
function updateQuests() {
    if (!questsList) return;

    let html = '';
    quests.forEach(quest => {
        let progressPercent = (quest.progress / quest.target * 100) + '%';

        html += `
            <div class="quest-card">
                <div class="quest-icon">${quest.id < 3 ? '💰' : quest.id < 6 ? '👆' : '🔒'}</div>
                <div class="quest-info">
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-progress">
                        <div class="quest-progress-fill" style="width: ${progressPercent}"></div>
                    </div>
                    <div class="quest-reward">🎁 ${quest.reward} монет</div>
                </div>
                ${quest.progress >= quest.target && !quest.claimed ?
                    '<button class="quest-btn" onclick="claimQuest(' + quest.id + ')">ЗАБРАТЬ</button>' :
                    quest.claimed ? '<button class="quest-btn completed" disabled>✅ ВЫПОЛНЕНО</button>' :
                    '<button class="quest-btn disabled" disabled>' + quest.progress + '/' + quest.target + '</button>'}
            </div>
        `;
    });
    questsList.innerHTML = html;
}

function checkQuests() {
    quests.forEach(quest => {
        if (!quest.claimed) {
            if (quest.id < 3) {
                if (coins >= quest.target) {
                    quest.progress = quest.target;
                } else {
                    quest.progress = coins;
                }
            } else if (quest.id < 6) {
                if (totalTaps >= quest.target) {
                    quest.progress = quest.target;
                } else {
                    quest.progress = totalTaps;
                }
            } else if (quest.id === 8) {
                if (tapLevel >= quest.target) {
                    quest.progress = quest.target;
                } else {
                    quest.progress = tapLevel;
                }
            } else if (quest.id === 9) {
                if (energyLevel >= quest.target) {
                    quest.progress = quest.target;
                } else {
                    quest.progress = energyLevel;
                }
            }

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
    let available = quests.filter(q => q.progress >= q.target && !q.claimed).length;
    if (questBadge) {
        questBadge.style.display = available > 0 ? 'flex' : 'none';
        questBadge.innerText = available;
    }
}

function claimQuest(id) {
    let quest = quests.find(q => q.id === id);
    if (!quest || quest.progress < quest.target || quest.claimed) return;

    coins += quest.reward;
    quest.claimed = true;

    localStorage.setItem(STORAGE_KEY + 'quests', JSON.stringify(quests));
    updateQuests();
    updateQuestBadge();
    updateUI();
    showToast('🎁 +' + quest.reward + ' монет!');
}

// ===== ЕЖЕДНЕВНАЯ НАГРАДА =====
function updateTimers() {
    let now = Date.now();
    let dayMs = 24 * 60 * 60 * 1000;

    // Daily
    if (now - lastDaily > dayMs) {
        if (dailyStatus) dailyStatus.innerText = '🎁 Доступно!';
        if (dailyBtn) dailyBtn.classList.remove('disabled');
    } else {
        let timeLeft = dayMs - (now - lastDaily);
        let hours = Math.floor(timeLeft / (60 * 60 * 1000));
        let minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        if (dailyTimer) dailyTimer.innerText = `через ${hours}ч ${minutes}м`;
        if (dailyBtn) dailyBtn.classList.add('disabled');
    }

    // Wheel
    if (now - lastWheel > dayMs) {
        if (wheelStatus) wheelStatus.innerText = '🎰 Доступно!';
        if (wheelBtn) wheelBtn.classList.remove('disabled');
        if (wheelTimerPreview) wheelTimerPreview.innerText = 'Готово!';
    } else {
        let timeLeft = dayMs - (now - lastWheel);
        let hours = Math.floor(timeLeft / (60 * 60 * 1000));
        let minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        if (wheelTimer) wheelTimer.innerText = `через ${hours}ч ${minutes}м`;
        if (wheelBtn) wheelBtn.classList.add('disabled');
        if (wheelTimerPreview) wheelTimerPreview.innerText = `${hours}ч ${minutes}м`;
    }
}

function claimDailyReward() {
    let now = Date.now();
    let dayMs = 24 * 60 * 60 * 1000;

    if (now - lastDaily < dayMs) {
        showToast('❌ Ещё не время');
        return;
    }

    let reward = 10 + Math.floor(Math.random() * 6);
    coins += reward;
    lastDaily = now;
    localStorage.setItem(STORAGE_KEY + 'lastDaily', lastDaily);

    updateUI();
    updateTimers();
    showToast('🎁 +' + reward + ' монет!');
}

function spinWheel() {
    let now = Date.now();
    let dayMs = 24 * 60 * 60 * 1000;

    if (now - lastWheel < dayMs) {
        showToast('❌ Ещё не время');
        return;
    }

    wheel.classList.add('wheel-spinning');

    let prizes = [
        { value: 5, weight: 30 },
        { value: 10, weight: 25 },
        { value: 20, weight: 15 },
        { value: 3, weight: 10 },
        { value: 50, weight: 8 },
        { value: 1, weight: 5 },
        { value: 30, weight: 4 },
        { value: 100, weight: 3 }
    ];

    let totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedPrize = prizes[0].value;
    let selectedIndex = 0;

    for (let i = 0; i < prizes.length; i++) {
        cumulative += prizes[i].weight;
        if (random < cumulative) {
            selectedPrize = prizes[i].value;
            selectedIndex = i;
            break;
        }
    }

    let spins = 5 + Math.floor(Math.random() * 5);
    let segmentAngle = 45;
    let targetAngle = selectedIndex * segmentAngle + segmentAngle / 2;
    let totalDegrees = spins * 360 + targetAngle;

    wheel.style.transform = `rotate(${totalDegrees}deg)`;

    setTimeout(() => {
        wheel.classList.remove('wheel-spinning');

        coins += selectedPrize;
        lastWheel = now;
        localStorage.setItem(STORAGE_KEY + 'lastWheel', lastWheel);

        updateUI();
        updateTimers();
        showToast('🎰 +' + selectedPrize + ' монет!');
    }, 3000);
}

// ===== ПОКУПКА VPN =====
function buyVPN(plan) {
    let price = plan === 'basic' ? 200 : plan === 'pro' ? 500 : 1000;

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

    quests.forEach(q => {
        if (q.id === 6 && plan === 'basic') q.progress = 1;
        if (q.id === 7 && plan === 'pro') q.progress = 1;
    });

    showToast('✅ Ключ отправлен в бота!');
    updateUI();
    checkQuests();
}

// ===== РЕГЕНЕРАЦИЯ ЭНЕРГИИ =====
function regenEnergy() {
    if (energy < maxEnergy) {
        energy += regenRate;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
    }
}

// ===== НИКНЕЙМ =====
function showFirstNicknameModal() {
    nicknameModal.classList.add('active');
}

function showNicknameModal() {
    if (coins < 100) {
        showToast('❌ Нужно 100 монет');
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

    // Если это не первый вход (есть старый ник) - списываем монеты
    if (localStorage.getItem(STORAGE_KEY + 'nickname')) {
        coins -= 100;
    }

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
    if (pageId === 'upgrades') {
        updateUpgradesUI();
    }
    if (pageId === 'shop') {
        updateTimers();
    }
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
window.buyTapUpgrade = buyTapUpgrade;
window.buyEnergyUpgrade = buyEnergyUpgrade;
window.buyRegenUpgrade = buyRegenUpgrade;
window.buyVPN = buyVPN;
window.claimQuest = claimQuest;
window.claimDailyReward = claimDailyReward;
window.spinWheel = spinWheel;
window.toggleMenu = toggleMenu;
window.showPage = showPage;
window.showNicknameModal = showNicknameModal;
window.closeModal = closeModal;
window.changeNickname = changeNickname;
window.toggleTheme = toggleTheme;
window.saveSetting = saveSetting;