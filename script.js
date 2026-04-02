const matches = [
  {
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    odds: ["1.85", "3.40", "4.20"],
    time: "Today 19:00"
  },
  {
    league: "La Liga",
    home: "Barcelona",
    away: "Sevilla",
    odds: ["1.60", "3.90", "5.20"],
    time: "Today 21:00"
  },
  {
    league: "Serie A",
    home: "Juventus",
    away: "Napoli",
    odds: ["2.10", "3.10", "3.50"],
    time: "Tomorrow 20:30"
  },
  {
    league: "Bundesliga",
    home: "Bayern Munich",
    away: "Dortmund",
    odds: ["1.75", "3.60", "4.40"],
    time: "Tomorrow 18:30"
  },
  {
    league: "Ligue 1",
    home: "PSG",
    away: "Lyon",
    odds: ["1.50", "4.20", "6.00"],
    time: "Saturday 22:00"
  }
];

const matchList = document.getElementById("matchList");

matches.forEach(match => {
  const card = document.createElement("div");
  card.className = "match-card";

  card.innerHTML = `
    <div class="league">${match.league}</div>
    <div class="teams">
      <div class="team">
        <span class="team-name">${match.home}</span>
        <div class="odds">
          <div class="odd">${match.odds[0]}</div>
        </div>
      </div>
      <div class="team">
        <span class="team-name">${match.away}</span>
        <div class="odds">
          <div class="odd">${match.odds[2]}</div>
        </div>
      </div>
    </div>
    <div class="odds">
      <div class="odd">${match.odds[0]}</div>
      <div class="odd">${match.odds[1]}</div>
      <div class="odd">${match.odds[2]}</div>
    </div>
    <div class="time">${match.time}</div>
  `;

  matchList.appendChild(card);
});
