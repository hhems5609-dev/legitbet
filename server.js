const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// API Key from Render Environment Variables
const ODDS_API_KEY = process.env.API; 

// Route to fetch Live Odds
app.get('/api/odds', async (req, res) => {
    try {
        // Fetching English Premier League (soccer_epl)
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&bookmakers=pinnacle`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch live odds" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

