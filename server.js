const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your index.html, style.css, etc.

// 🛠️ API Configuration (Uses the 'API' Key you added to Render)
const ODDS_API_KEY = process.env.API; 
const BASE_URL = 'https://api.the-odds-api.com/v4/sports/soccer_epl/odds';

// Route to get Live Betting Odds
app.get('/api/odds', async (req, res) => {
    if (!ODDS_API_KEY) {
        return res.status(500).json({ error: "API Key is missing on the server." });
    }

    try {
        const response = await fetch(`${BASE_URL}/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&bookmakers=pinnacle`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Return only the first 10 matches to keep it clean
        res.json(data.slice(0, 10)); 
    } catch (error) {
        console.error("Odds Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch live odds" });
    }
});

// Route for M-Pesa Deposit Simulation (Placeholder)
app.post('/api/deposit', (req, res) => {
    const { amount, phone } = req.body;
    console.log(`Simulating M-Pesa deposit: ${amount} KES for ${phone}`);
    res.json({ success: true, message: "STK Push Sent successfully!" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`LegitBet Server running on port ${PORT}`);
});
