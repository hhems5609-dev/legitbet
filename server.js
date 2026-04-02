const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// The Odds API key - get free key at https://the-odds-api.com
const ODDS_API_KEY = process.env.ODDS_API_KEY || 'demo';
const ODDS_BASE = 'https://api.the-odds-api.com/v4';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sport mapping
const SPORT_MAP = {
  soccer: 'soccer_epl',
  basketball: 'basketball_nba',
  tennis: 'tennis_atp_french_open',
};

// ---- ODDS API PROXY ----
app.get('/api/odds', async (req, res) => {
  const sport = req.query.sport || 'soccer';
  const sportKey = SPORT_MAP[sport] || 'soccer_epl';

  if (ODDS_API_KEY === 'demo') {
    return res.json(getMockGames(sport));
  }

  try {
    const url = `${ODDS_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Odds API error');
    const data = await response.json();

    // Transform to our format
    const games = data.slice(0, 15).map((g, i) => ({
      id: g.id || 'g' + i,
      league: g.sport_title || sport,
      time: new Date(g.commence_time).toLocaleString('en-KE', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      home: g.home_team,
      away: g.away_team,
      odds: extractOdds(g, sport),
      markets: Math.floor(Math.random() * 80 + 30)
    }));

    res.json(games);
  } catch (err) {
    console.error('Odds API Error:', err.message);
    res.json(getMockGames(sport));
  }
});

function extractOdds(game, sport) {
  try {
    const bm = game.bookmakers?.[0];
    const h2h = bm?.markets?.find(m => m.key === 'h2h');
    if (!h2h) return { h: 2.00, d: 3.50, a: 3.00 };
    const outcomes = h2h.outcomes;
    const home = outcomes.find(o => o.name === game.home_team)?.price || 2.00;
    const away = outcomes.find(o => o.name === game.away_team)?.price || 3.00;
    const draw = outcomes.find(o => o.name === 'Draw')?.price || null;
    return { h: home, d: draw, a: away };
  } catch {
    return { h: 2.00, d: 3.50, a: 3.00 };
  }
}

// ---- LIVE GAMES ----
app.get('/api/live', async (req, res) => {
  res.json({ count: Math.floor(Math.random() * 50 + 100) });
});

// ---- PAYMENT SIMULATION ----
app.post('/api/deposit', (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Missing fields' });
  // In production: integrate Daraja M-Pesa STK Push API here
  setTimeout(() => {
    res.json({ success: true, message: `STK Push sent to ${phone} for KES ${amount}` });
  }, 1500);
});

app.post('/api/withdraw', (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Missing fields' });
  // In production: integrate Daraja B2C API here
  res.json({ success: true, message: `KES ${amount} sent to ${phone}` });
});

// ---- MOCK DATA ----
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
    { id: 'g11', league: 'Africa Cup', time: '01/04, 14:00', home: 'Kenya', away: 'Egypt', odds: { h: 4.20, d: 3.50, a: 1.75 }, markets: 56 },
    { id: 'g12', league: 'Kenya Premier League', time: '01/04, 15:00', home: 'Gor Mahia', away: 'AFC Leopards', odds: { h: 1.95, d: 3.20, a: 3.60 }, markets: 44 },
  ];
  const basketballGames = [
    { id: 'b1', league: 'NBA', time: '01/04, 01:30', home: 'LA Lakers', away: 'Golden State Warriors', odds: { h: 1.90, d: null, a: 1.88 }, markets: 45 },
    { id: 'b2', league: 'NBA', time: '01/04, 00:00', home: 'Chicago Bulls', away: 'Boston Celtics', odds: { h: 2.50, d: null, a: 1.55 }, markets: 38 },
    { id: 'b3', league: 'EuroLeague', time: '01/04, 18:00', home: 'Real Madrid', away: 'CSKA Moscow', odds: { h: 1.70, d: null, a: 2.10 }, markets: 40 },
  ];
  return sport === 'basketball' ? basketballGames : soccerGames;
}

// ---- CATCH ALL ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ LEGIT BET server running on port ${PORT}`);
});
