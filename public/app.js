async function loadLiveOdds() {
    const container = document.getElementById('odds-container');
    try {
        const response = await fetch('/api/odds');
        const matches = await response.json();
        container.innerHTML = ''; 

        matches.forEach(m => {
            const outcomes = m.bookmakers[0].markets[0].outcomes;
            const h = outcomes.find(o => o.name === m.home_team)?.price || '-';
            const a = outcomes.find(o => o.name === m.away_team)?.price || '-';
            const d = outcomes.find(o => o.name === 'Draw')?.price || '-';

            container.insertAdjacentHTML('beforeend', `
                <div class="match-row">
                    <div class="league">International • Int. Friendly</div>
                    <div class="match-flex">
                        <div class="teams">${m.home_team}<br>${m.away_team}</div>
                        <div class="odds-grp">
                            <div class="odd">${h}</div>
                            <div class="odd">${d}</div>
                            <div class="odd">${a}</div>
                        </div>
                    </div>
                    <div class="markets">+78 Markets</div>
                </div>
            `);
        });
    } catch (err) { console.error("Update failed"); }
}
window.onload = loadLiveOdds;
