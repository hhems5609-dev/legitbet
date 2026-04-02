async function startApp() {
    const container = document.getElementById('odds-container');
    
    try {
        const response = await fetch('/api/odds');
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No matches found.</p>';
            return;
        }

        container.innerHTML = ''; // Clear the "Searching" message

        data.forEach(match => {
            const bookmaker = match.bookmakers[0];
            if (!bookmaker) return;
            const market = bookmaker.markets[0];

            const h = market.outcomes.find(o => o.name === match.home_team)?.price || '-';
            const a = market.outcomes.find(o => o.name === match.away_team)?.price || '-';
            const d = market.outcomes.find(o => o.name === 'Draw')?.price || '-';

            const card = `
                <div class="match-card">
                    <div style="font-size:14px; font-weight:bold;">${match.home_team} vs ${match.away_team}</div>
                    <div class="odds-row">
                        <button class="odd-btn">1<br>${h}</button>
                        <button class="odd-btn">X<br>${d}</button>
                        <button class="odd-btn">2<br>${a}</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) {
        container.innerHTML = '<p style="text-align:center; color:red;">Server Connection Error</p>';
    }
}

document.addEventListener('DOMContentLoaded', startApp);
