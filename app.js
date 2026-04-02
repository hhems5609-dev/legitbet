async function fetchOdds() {
    const container = document.getElementById('odds-container');
    if (!container) return;

    try {
        const response = await fetch('/api/odds');
        const data = await response.json();

        if (data.error) {
            container.innerHTML = `<p style="color:red; text-align:center;">${data.error}</p>`;
            return;
        }

        // Clear existing placeholders
        container.innerHTML = '';

        data.forEach(match => {
            // Find the odds from the first available bookmaker (Pinnacle)
            const bookmaker = match.bookmakers[0];
            if (!bookmaker) return;

            const market = bookmaker.markets.find(m => m.key === 'h2h');
            if (!market) return;

            // Extract odds for Home, Away, and Draw
            const homeOdds = market.outcomes.find(o => o.name === match.home_team)?.price || '-';
            const awayOdds = market.outcomes.find(o => o.name === match.away_team)?.price || '-';
            const drawOdds = market.outcomes.find(o => o.name === 'Draw')?.price || '-';

            // Create the HTML for the match card
            const matchCard = `
                <div class="match-item" style="border-bottom: 1px solid #333; padding: 15px 0;">
                    <div class="match-info" style="margin-bottom: 10px;">
                        <span style="color: #888; font-size: 12px;">EPL</span>
                        <div style="display: flex; justify-content: space-between; font-weight: bold; color: white;">
                            <span>${match.home_team}</span>
                            <span style="color: #ffda00;">${new Date(match.commence_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style="color: white; font-weight: bold;">${match.away_team}</div>
                    </div>
                    <div class="odds-buttons" style="display: flex; gap: 10px;">
                        <button class="odd-btn">1 <br> <b>${homeOdds}</b></button>
                        <button class="odd-btn">X <br> <b>${drawOdds}</b></button>
                        <button class="odd-btn">2 <br> <b>${awayOdds}</b></button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', matchCard);
        });

    } catch (err) {
        console.error("Frontend Error:", err);
        container.innerHTML = '<p style="color:red; text-align:center;">Connection Error</p>';
    }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', fetchOdds);
