async function fetchOdds() {
    const container = document.getElementById('odds-container');
    if (!container) return;

    try {
        const response = await fetch('/api/odds');
        const data = await response.json();

        if (data.error || !Array.isArray(data)) {
            container.innerHTML = '<p style="color:white; text-align:center;">No matches available right now.</p>';
            return;
        }

        container.innerHTML = ''; // Clear the "Nothing" screen

        data.forEach(match => {
            const bookmaker = match.bookmakers[0];
            if (!bookmaker) return;
            const market = bookmaker.markets[0];

            const homeOdds = market.outcomes.find(o => o.name === match.home_team)?.price || '-';
            const awayOdds = market.outcomes.find(o => o.name === match.away_team)?.price || '-';
            const drawOdds = market.outcomes.find(o => o.name === 'Draw')?.price || '-';

            const html = `
                <div style="background:#1a1a1a; margin:10px; padding:15px; border-radius:8px; color:white;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>${match.home_team} vs ${match.away_team}</span>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button style="flex:1; background:#333; color:white; border:none; padding:10px;">1: ${homeOdds}</button>
                        <button style="flex:1; background:#333; color:white; border:none; padding:10px;">X: ${drawOdds}</button>
                        <button style="flex:1; background:#333; color:white; border:none; padding:10px;">2: ${awayOdds}</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    } catch (err) {
        container.innerHTML = '<p style="color:red; text-align:center;">Connection Error</p>';
    }
}
document.addEventListener('DOMContentLoaded', fetchOdds);
