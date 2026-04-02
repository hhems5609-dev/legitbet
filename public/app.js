// ===== LEGIT BET - MAIN APP JS =====

// ---- STATE ----
let betslip = [];
let balance = 1000;
let myBets = [];
let liveCount = 0;
let crashState = 'waiting'; // waiting | running | crashed
let crashMultiplier = 1.00;
let crashBetActive = false;
let crashBetAmount = 0;
let crashInterval = null;
let crashCanvas, crashCtx;
let crashPoints = [];

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateBalance(balance);
  loadSoccerGames();
  loadCrashHistory();
  startCrashGame();
  startVirtualTimers();
  startLiveCounter();
  renderMyBets();
  crashCanvas = document.getElementById('crashCanvas');
  crashCtx = crashCanvas ? crashCanvas.getContext('2d') : null;
});

// ---- SIDEBAR ----
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('show');
}

// ---- TABS ----
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('tab-' + tab);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  // Load data for tab
  if (tab === 'soccer') loadSoccerGames();
  if (tab === 'basketball') loadBasketballGames();
  if (tab === 'jackpot') loadJackpotGames();
}

// ---- MODALS ----
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
  if (id === 'betslipModal') renderBetslip();
  if (id === 'myBetsModal') renderMyBets();
  if (id === 'profileModal') renderProfile();
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// ---- BALANCE ----
function updateBalance(amt) {
  balance = amt;
  document.getElementById('userBalance').textContent = 'KES ' + amt.toFixed(2);
}

// ---- ODDS API (The Odds API - free tier) ----
const ODDS_API_KEY = 'YOUR_ODDS_API_KEY'; // Replace in .env
const ODDS_API_BASE = '/api/odds';

async function fetchOdds(sport) {
  try {
    const res = await fetch(`${ODDS_API_BASE}?sport=${sport}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (e) {
    return getMockGames(sport);
  }
}

// ---- MOCK GAMES (Fallback) ----
function getMockGames(sport) {
  const soccerGames = [
    { id: 'g1', league: 'International • Int. Friendly', time: '01/04, 03:00', home: 'Brazil', away: 'Croatia', odds: { h: 1.78, d: 3.90, a: 4.10 }, markets: 78 },
    { id: 'g2', league: 'International • Int. Friendly', time: '01/04, 04:00', home: 'Mexico', away: 'Belgium', odds: { h: 3.60, d: 3.50, a: 2.02 }, markets: 78 },
    { id: 'g3', league: 'International • Int. Friendly', time: '01/04, 02:00', home: 'USA', away: 'Portugal', odds: { h: 4.70, d: 4.20, a: 1.63 }, markets: 84 },
    { id: 'g4', league: 'International • Int. Friendly', time: '01/04, 02:30', home: 'Argentina', away: 'Zambia', odds: { h: 1.05, d: 13.00, a: 35.00 }, markets: 34 },
    { id: 'g5', league: 'FIFA World Cup Qualifiers', time: '01/04, 00:00', home: 'France', away: 'Ukraine', odds: { h: 1.25, d: 6.50, a: 12.00 }, markets: 92 },
    { id: 'g6', league: 'Premier League', time: '01/04, 17:00', home: 'Man City', away: 'Liverpool', odds: { h: 2.20, d: 3.40, a: 3.10 }, markets: 102 },
    { id: 'g7', league: 'La Liga', time: '01/04, 20:00', home: 'Real Madrid', away: 'Barcelona', odds: { h: 2.05, d: 3.80, a: 3.30 }, markets: 110 },
    { id: 'g8', league: 'Serie A', time: '01/04, 19:45', home: 'Inter Milan', away: 'AC Milan', odds: { h: 1.90, d: 3.60, a: 3.80 }, markets: 88 },
    { id: 'g9', league: 'Bundesliga', time: '01/04, 18:30', home: 'Bayern Munich', away: 'Dortmund', odds: { h: 1.55, d: 4.50, a: 5.20 }, markets: 96 },
    { id: 'g10', league: 'Champions League', time: '01/04, 21:00', home: 'PSG', away: 'Man United', odds: { h: 1.85, d: 3.70, a: 3.95 }, markets: 120 },
    { id: 'g11', league: 'Ligue 1', time: '01/04, 16:00', home: 'Monaco', away: 'Marseille', odds: { h: 2.30, d: 3.20, a: 2.90 }, markets: 74 },
    { id: 'g12', league: 'Africa Cup', time: '01/04, 14:00', home: 'Kenya', away: 'Egypt', odds: { h: 4.20, d: 3.50, a: 1.75 }, markets: 56 },
  ];
  const basketballGames = [
    { id: 'b1', league: 'NBA', time: '01/04, 01:30', home: 'Lakers', away: 'Warriors', odds: { h: 1.90, d: null, a: 1.88 }, markets: 45 },
    { id: 'b2', league: 'NBA', time: '01/04, 00:00', home: 'Bulls', away: 'Celtics', odds: { h: 2.50, d: null, a: 1.55 }, markets: 38 },
    { id: 'b3', league: 'EuroLeague', time: '01/04, 18:00', home: 'Real Madrid', away: 'CSKA', odds: { h: 1.70, d: null, a: 2.10 }, markets: 40 },
  ];
  return sport === 'basketball' ? basketballGames : soccerGames;
}

// ---- RENDER GAMES ----
function renderGames(games, containerId, sport) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    const isBasket = sport === 'basketball';
    card.innerHTML = `
      <div class="game-meta">
        <span class="league">${g.league}</span>
        <span class="kick-time">${g.time}</span>
      </div>
      <div class="game-teams">
        <div class="teams-names">
          <span class="team-name">${g.home}</span>
          <span class="team-name">${g.away}</span>
        </div>
        <button class="odd-btn" id="odd-${g.id}-h" onclick="addToBetslip('${g.id}', '${g.home}', '${g.away}', '1', ${g.odds.h}, '${g.league}', '${g.time}')">${g.odds.h.toFixed(2)}</button>
        ${!isBasket ? `<button class="odd-btn" id="odd-${g.id}-d" onclick="addToBetslip('${g.id}', '${g.home}', '${g.away}', 'X', ${g.odds.d}, '${g.league}', '${g.time}')">${g.odds.d ? g.odds.d.toFixed(2) : '-'}</button>` : `<button class="odd-btn" style="opacity:.3" disabled>-</button>`}
        <button class="odd-btn" id="odd-${g.id}-a" onclick="addToBetslip('${g.id}', '${g.home}', '${g.away}', '2', ${g.odds.a}, '${g.league}', '${g.time}')">${g.odds.a.toFixed(2)}</button>
      </div>
      <div class="more-markets">+${g.markets} Markets</div>
    `;
    el.appendChild(card);
  });
}

async function loadSoccerGames() {
  const games = await fetchOdds('soccer');
  renderGames(games, 'soccerGames', 'soccer');
  document.getElementById('liveBadge').textContent = Math.floor(Math.random() * 50 + 100);
}
async function loadBasketballGames() {
  const games = await fetchOdds('basketball');
  renderGames(games, 'basketballGames', 'basketball');
}
async function loadJackpotGames() {
  const games = getMockGames('soccer').slice(0, 8);
  renderGames(games, 'jackpotGames', 'soccer');
}

// ---- BETSLIP ----
function addToBetslip(gameId, home, away, pick, odd, league, time) {
  const existing = betslip.findIndex(b => b.gameId === gameId);
  if (existing !== -1) {
    if (betslip[existing].pick === pick) {
      betslip.splice(existing, 1);
      const btn = document.getElementById(`odd-${gameId}-${pick.toLowerCase()}`);
      if (btn) btn.classList.remove('selected');
    } else {
      const oldBtn = document.getElementById(`odd-${gameId}-${betslip[existing].pick.toLowerCase()}`);
      if (oldBtn) oldBtn.classList.remove('selected');
      betslip[existing] = { gameId, home, away, pick, odd, league, time };
    }
  } else {
    betslip.push({ gameId, home, away, pick, odd, league, time });
  }
  const btn = document.getElementById(`odd-${gameId}-${pick.toLowerCase()}`);
  if (btn) {
    const isSelected = betslip.some(b => b.gameId === gameId && b.pick === pick);
    btn.classList.toggle('selected', isSelected);
  }
  updateBetslipFab();
  showToast(`${home} vs ${away} — ${pick} (${odd}) ${betslip.some(b=>b.gameId===gameId&&b.pick===pick)?'added':'removed'}`);
}

function updateBetslipFab() {
  const fab = document.getElementById('betslipFab');
  const countEl = document.getElementById('betslipCount');
  countEl.textContent = betslip.length;
  fab.classList.toggle('show', betslip.length > 0);
}

function renderBetslip() {
  const items = document.getElementById('betslipItems');
  const footer = document.getElementById('betslipFooter');
  const empty = document.getElementById('emptySlip');
  if (!betslip.length) {
    items.innerHTML = '';
    footer.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  footer.style.display = 'block';
  items.innerHTML = betslip.map((b, i) => `
    <div class="betslip-item">
      <button class="remove-item" onclick="removeBetslipItem(${i})">✕</button>
      <div class="betslip-item-title">${b.home} vs ${b.away}</div>
      <div class="betslip-item-sub">${b.league} • ${b.time} • Pick: <strong>${b.pick}</strong></div>
      <div class="betslip-item-odd">${b.odd.toFixed(2)}</div>
    </div>
  `).join('');
  calcWin();
}

function removeBetslipItem(i) {
  const b = betslip[i];
  const btn = document.getElementById(`odd-${b.gameId}-${b.pick.toLowerCase()}`);
  if (btn) btn.classList.remove('selected');
  betslip.splice(i, 1);
  updateBetslipFab();
  renderBetslip();
}

function clearBetslip() {
  betslip.forEach(b => {
    const btn = document.getElementById(`odd-${b.gameId}-${b.pick.toLowerCase()}`);
    if (btn) btn.classList.remove('selected');
  });
  betslip = [];
  updateBetslipFab();
  renderBetslip();
}

function calcWin() {
  if (!betslip.length) return;
  const totalOdds = betslip.reduce((acc, b) => acc * b.odd, 1);
  const stake = parseFloat(document.getElementById('stakeAmount').value) || 0;
  document.getElementById('totalOdds').textContent = totalOdds.toFixed(2);
  document.getElementById('potentialWin').textContent = 'KES ' + (stake * totalOdds).toFixed(2);
}

function placeBet() {
  if (!betslip.length) { showToast('Add games to your betslip first!'); return; }
  const stake = parseFloat(document.getElementById('stakeAmount').value);
  if (!stake || stake < 10) { showToast('Minimum stake is KES 10'); return; }
  if (stake > balance) { showToast('Insufficient balance! Please deposit.'); return; }
  const totalOdds = betslip.reduce((acc, b) => acc * b.odd, 1);
  const potWin = (stake * totalOdds).toFixed(2);
  const bet = {
    id: Date.now(),
    games: [...betslip],
    stake,
    totalOdds: totalOdds.toFixed(2),
    potentialWin: potWin,
    time: new Date().toLocaleString(),
    status: 'pending'
  };
  myBets.unshift(bet);
  updateBalance(balance - stake);
  clearBetslip();
  closeModal('betslipModal');
  showToast(`✅ Bet placed! KES ${stake} → Potential Win: KES ${potWin}`);
}

// ---- MY BETS ----
function renderMyBets() {
  const el = document.getElementById('myBetsList');
  if (!el) return;
  if (!myBets.length) {
    el.innerHTML = '<p class="empty-slip">No bets placed yet.</p>';
    return;
  }
  el.innerHTML = myBets.map(b => `
    <div class="my-bet-card">
      <span class="my-bet-status status-${b.status}">${b.status.toUpperCase()}</span>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">${b.time}</div>
      ${b.games.map(g => `<div style="font-size:13px;margin-bottom:3px">${g.home} vs ${g.away} — <strong>${g.pick}</strong> @ ${g.odd}</div>`).join('')}
      <div style="margin-top:8px;font-size:13px">Stake: <strong>KES ${b.stake}</strong> | Odds: <strong>${b.totalOdds}</strong> | Win: <strong style="color:var(--accent-green)">KES ${b.potentialWin}</strong></div>
    </div>
  `).join('');
}

// ---- PROFILE ----
function renderProfile() {
  document.getElementById('profileBalance').textContent = 'KES ' + balance.toFixed(2);
  document.getElementById('profileBets').textContent = myBets.length;
}
function loginUser() {
  showToast('Login/Register coming soon!');
}

// ---- DEPOSIT / WITHDRAW ----
function processDeposit() {
  const phone = document.getElementById('mpesaPhone').value;
  const amt = parseFloat(document.getElementById('depositAmt').value);
  if (!phone || phone.length < 10) { showToast('Enter valid M-Pesa number'); return; }
  if (!amt || amt < 10) { showToast('Minimum deposit is KES 10'); return; }
  updateBalance(balance + amt);
  closeModal('depositModal');
  showToast(`✅ KES ${amt} deposited successfully via M-Pesa!`);
}
function processWithdraw() {
  const phone = document.getElementById('withdrawPhone').value;
  const amt = parseFloat(document.getElementById('withdrawAmt').value);
  if (!phone || phone.length < 10) { showToast('Enter valid M-Pesa number'); return; }
  if (!amt || amt < 100) { showToast('Minimum withdrawal is KES 100'); return; }
  if (amt > balance) { showToast('Insufficient balance!'); return; }
  updateBalance(balance - amt);
  closeModal('withdrawModal');
  showToast(`✅ KES ${amt} sent to ${phone} via M-Pesa!`);
}

// ---- CRASH GAME ----
const crashHistory = [];

function startCrashGame() {
  setTimeout(runCrashRound, 3000);
}

function runCrashRound() {
  crashState = 'running';
  crashMultiplier = 1.00;
  crashPoints = [];
  const crashAt = generateCrashPoint();
  const status = document.getElementById('crashStatus');
  const multEl = document.getElementById('crashMultiplier');
  const betBtn = document.getElementById('crashBetBtn');
  const cashoutBtn = document.getElementById('cashoutBtn');

  if (status) status.textContent = '🚀 Round Running...';
  if (multEl) multEl.className = 'crash-multiplier';
  if (cashoutBtn && crashBetActive) cashoutBtn.disabled = false;

  let elapsed = 0;
  crashInterval = setInterval(() => {
    elapsed += 100;
    crashMultiplier = parseFloat((Math.pow(Math.E, 0.00006 * elapsed)).toFixed(2));
    if (multEl) multEl.textContent = crashMultiplier.toFixed(2) + 'x';

    // Auto cashout
    const autoCO = parseFloat(document.getElementById('autoCashout')?.value || 0);
    if (crashBetActive && autoCO > 0 && crashMultiplier >= autoCO) {
      cashOut();
    }

    drawCrashGraph(elapsed, false);

    if (crashMultiplier >= crashAt) {
      clearInterval(crashInterval);
      crashState = 'crashed';
      if (multEl) { multEl.textContent = 'CRASHED! ' + crashMultiplier.toFixed(2) + 'x'; multEl.className = 'crash-multiplier crashed'; }
      if (status) status.textContent = '💥 Crashed at ' + crashMultiplier.toFixed(2) + 'x';
      if (cashoutBtn) cashoutBtn.disabled = true;
      if (betBtn) betBtn.disabled = false;
      drawCrashGraph(elapsed, true);

      // Record history
      addCrashHistory(crashMultiplier.toFixed(2));

      if (crashBetActive) {
        crashBetActive = false;
        showToast('💥 Crashed! You lost KES ' + crashBetAmount);
      }

      setTimeout(() => {
        crashState = 'waiting';
        crashPoints = [];
        if (multEl) { multEl.textContent = '1.00x'; multEl.className = 'crash-multiplier'; }
        if (status) status.textContent = 'Next round starting in 5s...';
        if (crashCtx && crashCanvas) {
          crashCtx.clearRect(0, 0, crashCanvas.width, crashCanvas.height);
        }
        setTimeout(runCrashRound, 5000);
      }, 3000);
    }
  }, 100);
}

function generateCrashPoint() {
  // House edge simulation
  const rand = Math.random();
  if (rand < 0.15) return 1.00 + Math.random() * 0.5;
  if (rand < 0.50) return 1.5 + Math.random() * 1.5;
  if (rand < 0.80) return 3 + Math.random() * 5;
  return 8 + Math.random() * 20;
}

function drawCrashGraph(elapsed, crashed) {
  if (!crashCtx || !crashCanvas) return;
  const w = crashCanvas.width, h = crashCanvas.height;
  crashCtx.clearRect(0, 0, w, h);

  const points = [];
  const maxT = Math.max(elapsed, 1000);
  for (let t = 0; t <= elapsed; t += 100) {
    const mult = Math.pow(Math.E, 0.00006 * t);
    const x = (t / maxT) * (w - 20) + 10;
    const y = h - 10 - ((mult - 1) / (crashMultiplier - 1 || 1)) * (h - 30);
    points.push({ x, y });
  }

  if (points.length < 2) return;
  crashCtx.beginPath();
  crashCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) crashCtx.lineTo(points[i].x, points[i].y);
  crashCtx.strokeStyle = crashed ? '#ff3d00' : '#00e676';
  crashCtx.lineWidth = 3;
  crashCtx.shadowColor = crashed ? '#ff3d00' : '#00e676';
  crashCtx.shadowBlur = 10;
  crashCtx.stroke();

  // Fill
  crashCtx.lineTo(points[points.length - 1].x, h - 10);
  crashCtx.lineTo(points[0].x, h - 10);
  crashCtx.closePath();
  const grad = crashCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, crashed ? 'rgba(255,61,0,0.3)' : 'rgba(0,230,118,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  crashCtx.fillStyle = grad;
  crashCtx.fill();
  crashCtx.shadowBlur = 0;
}

function placeCrashBet() {
  if (crashState !== 'waiting' && crashState !== 'running') {
    showToast('Wait for the next round!'); return;
  }
  const amt = parseFloat(document.getElementById('crashBetAmount').value);
  if (!amt || amt < 10) { showToast('Minimum crash bet is KES 10'); return; }
  if (amt > balance) { showToast('Insufficient balance!'); return; }
  crashBetActive = true;
  crashBetAmount = amt;
  updateBalance(balance - amt);
  document.getElementById('crashBetBtn').disabled = true;
  showToast('✅ Crash bet placed: KES ' + amt);
}

function cashOut() {
  if (!crashBetActive) return;
  cashoutBtn = document.getElementById('cashoutBtn');
  crashBetActive = false;
  const win = parseFloat((crashBetAmount * crashMultiplier).toFixed(2));
  updateBalance(balance + win);
  if (cashoutBtn) cashoutBtn.disabled = true;
  document.getElementById('crashBetBtn').disabled = false;
  showToast('💰 Cashed out at ' + crashMultiplier.toFixed(2) + 'x → KES ' + win);
}

function addCrashHistory(mult) {
  crashHistory.unshift(parseFloat(mult));
  if (crashHistory.length > 20) crashHistory.pop();
  const el = document.getElementById('crashHistoryList');
  if (!el) return;
  el.innerHTML = crashHistory.map(m => {
    let cls = m >= 5 ? 'chip-high' : m >= 2 ? 'chip-mid' : 'chip-low';
    return `<span class="crash-result-chip ${cls}">${m.toFixed(2)}x</span>`;
  }).join('');
}

function loadCrashHistory() {
  const samples = [9.45, 1.23, 3.77, 1.01, 2.50, 15.20, 1.45, 6.30, 1.00, 4.88];
  samples.forEach(s => crashHistory.push(s));
  const el = document.getElementById('crashHistoryList');
  if (!el) return;
  el.innerHTML = crashHistory.map(m => {
    let cls = m >= 5 ? 'chip-high' : m >= 2 ? 'chip-mid' : 'chip-low';
    return `<span class="crash-result-chip ${cls}">${m.toFixed(2)}x</span>`;
  }).join('');
}

// ---- VIRTUAL TIMERS ----
function startVirtualTimers() {
  const timers = [
    { id: 'vTimer1', seconds: 45 },
    { id: 'vTimer2', seconds: 80 },
    { id: 'vTimer3', seconds: 30 },
    { id: 'vTimer4', seconds: 130 }
  ];
  timers.forEach(t => runTimer(t.id, t.seconds));
}

function runTimer(id, startSec) {
  let sec = startSec;
  const el = document.getElementById(id);
  const tick = setInterval(() => {
    if (!el) { clearInterval(tick); return; }
    if (sec <= 0) {
      sec = Math.floor(Math.random() * 120 + 30);
      el.style.color = 'var(--accent-green)';
    } else {
      sec--;
    }
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    el.textContent = 'Next: ' + m + ':' + s;
  }, 1000);
}

// ---- LIVE COUNTER ----
function startLiveCounter() {
  let count = Math.floor(Math.random() * 50 + 100);
  const el = document.getElementById('liveBadge');
  setInterval(() => {
    count += Math.floor(Math.random() * 5 - 2);
    count = Math.max(80, count);
    if (el) el.textContent = count;
  }, 5000);
}

// ---- CASINO / VIRTUAL GAMES ----
function openCasinoGame(game) {
  showToast('🎰 Opening ' + game.charAt(0).toUpperCase() + game.slice(1) + '...');
}
function openVirtual(sport) {
  showToast('🎮 Loading Virtual ' + sport.charAt(0).toUpperCase() + sport.slice(1) + '...');
}
function showLive() {
  switchTab('soccer', null);
  showToast('📺 Showing Live Games');
}

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- ODDS AUTO-REFRESH (every 60s) ----
setInterval(() => {
  loadSoccerGames();
}, 60000);
