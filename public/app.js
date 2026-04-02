async function updateUI() {
    const container = document.getElementById('odds-container');
    try {
        const res = await fetch('/api/odds');
        const data = await res.json();
        
        container.innerHTML = ''; 

        data.forEach(m => {
            const odds = m.bookmakers[0].markets[0].outcomes;
            const h = odds.find(o => o.name === m.home_team)?.price || '-';
            const a = odds.find(o => o.name === m.away_team)?.price || '-';
            const d = odds.find(o => o.name === 'Draw')?.price || '-';

            container.insertAdjacentHTML('beforeend', `
                <div class="match-card">
                    <div class="league-info">International • Int. Friendly</div>
                    <div class="match-main">
                        <div class="team-names">${m.home_team}<br>${m.away_team}</div>
                        <div class="odds-container">
                            <div class="odd-box">${h}</div>
                            <div class="odd-box">${d}</div>
                            <div class="odd-box">${a}</div>
                        </div>
                    </div>
                    <div class="markets-link">+78 Markets</div>
                </div>
            `);
        });
    } catch (e) {
        console.log("Error loading odds");
    }
}
window.onload = updateUI;
