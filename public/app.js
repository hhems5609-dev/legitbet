// Function to handle bet selection
function selectBet(team, type, price) {
    alert(`Added to Betslip: ${team} (${type}) at ${price}`);
    // In the next step, we will make this actually update the yellow Betslip pill count
}

async function loadLiveOdds() {
    const container = document.getElementById('odds-container');
    try {
        const response = await fetch('/api/odds');
        const matches = await response.json();
        container.innerHTML = ''; 

        matches.forEach(m => {
            const outcomes = m.bookmakers[0].markets[0].outcomes;
            const h = outcomes.find(o => o.name === m.home_team);
            const a = outcomes.find(o => o.name === m.away_team);
            const d = outcomes.find(o => o.name === 'Draw');

            const matchHtml = `
                <div class="match-row">
                    <div class="league">International • Int. Friendly</div>
                    <div class="match-flex">
                        <div class="teams">${m.home_team}<br>${m.away_team}</div>
                        <div class="odds-grp">
                            <button class="odd" onclick="selectBet('${m.home_team}', '1', ${h.price})">${h.price}</button>
                            <button class="odd" onclick="selectBet('Draw', 'X', ${d.price})">${d.price}</button>
                            <button class="odd" onclick="selectBet('${m.away_team}', '2', ${a.price})">${a.price}</button>
                        </div>
                    </div>
                    <div class="markets" onclick="alert('Opening all markets...')">+78 Markets</div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', matchHtml);
        });
    } catch (err) { console.error("Update failed"); }
}
window.onload = loadLiveOdds;
