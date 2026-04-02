async function fetchOdds() {
    const container = document.getElementById('odds-container');
    if (!container) return;

    try {
        const response = await fetch('/api/odds');
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p style="color:white; text-align:center;">No active matches found.</p>';
            return;
        }

        container.innerHTML = ''; // Remove the "Loading" text

        data.forEach(match => {
            const bookmaker = match.bookmakers[0];
            if (!bookmaker) return;
            const market = bookmaker.markets[0];

            const h = market.outcomes.find(o => o.name === match.home_team)?.price || '-';
            const a = market.outcomes.find(o => o.name === match.away_team)?.price || '-';
            const d = market.outcomes.find(o => o.name === 'Draw')?.price || '-';

            const card = `
                <div style="background:#1e2124; margin:10px; padding:15px; border-radius:10px; border:1px solid #333;">
                    <div style="color:#888; font-size:11px; margin-bottom:5px;">PREMIER LEAGUE</div>
                    <div style="display:flex; justify-content:space-between; color:white; font-weight:bold; margin-bottom:12px;">
                        <span>${match.home_team} vs ${match.away_team}</span>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button style="flex:1; background:#2b2f36; color:#00ff88; border:none; padding:12px; border-radius:5px;">1 <br><b>${h}</b></button>
                        <button style="flex:1; background:#2b2f36; color:#00ff88; border:none; padding:12px; border-radius:5px;">X <br><b>${d}</b></button>
                        <button style="flex:1; background:#2b2f36; color:#00ff88; border:none; padding:12px; border-radius:5px;">2 <br><b>${a}</b></button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (err) {
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load odds.</p>';
    }
}
document.addEventListener('DOMContentLoaded', fetchOdds);
