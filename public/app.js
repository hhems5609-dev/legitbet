async function loadMatches() {
    const box = document.getElementById('odds-container');
    
    try {
        const res = await fetch('/api/odds');
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            box.innerHTML = '<p style="text-align:center;">No matches found right now.</p>';
            return;
        }

        box.innerHTML = ''; // Clear loading text

        data.forEach(m => {
            const bookie = m.bookmakers[0];
            if (!bookie) return;
            const odds = bookie.markets[0].outcomes;

            const h = odds.find(o => o.name === m.home_team)?.price || '-';
            const a = odds.find(o => o.name === m.away_team)?.price || '-';
            const d = odds.find(o => o.name === 'Draw')?.price || '-';

            box.insertAdjacentHTML('beforeend', `
                <div class="match-card">
                    <div style="font-weight:bold; margin-bottom:5px;">${m.home_team} vs ${m.away_team}</div>
                    <div class="odds-row">
                        <button class="btn">1<br>${h}</button>
                        <button class="btn">X<br>${d}</button>
                        <button class="btn">2<br>${a}</button>
                    </div>
                </div>
            `);
        });
    } catch (err) {
        box.innerHTML = '<p style="text-align:center; color:red;">Connection Error. Refreshing...</p>';
    }
}

window.onload = loadMatches;
