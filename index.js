const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* =========================================================
   CONFIG
========================================================= */

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

const PREFIX = ",";
const OWNER_ID = "1547542814525493269";

if (!TOKEN) {
  console.error("DISCORD_TOKEN is missing.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* =========================================================
   DATABASE
========================================================= */

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = {
  users: {},
  seasons: {
    current: 1,
    history: []
  }
};

if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

    db = {
      users: loaded.users || {},
      seasons: loaded.seasons || {
        current: 1,
        history: []
      }
    };
  } catch (error) {
    console.log("Database could not be loaded. Creating a new one.");
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* =========================================================
   HELPERS
========================================================= */

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function formatNumber(number) {
  return Number(number || 0).toLocaleString();
}

function xpRequired(level) {
  return 100 + level * 75;
}

function ownerOnly(id) {
  return id === OWNER_ID;
}

/* =========================================================
   RARITIES
========================================================= */

const RARITIES = {
  Common: 50,
  Uncommon: 25,
  Rare: 13,
  Epic: 7,
  Legendary: 3.5,
  Mythic: 1.2,
  Secret: 0.3
};

/* =========================================================
   COUNTRIES
========================================================= */

const COUNTRIES = [
  "Japan",
  "Germany",
  "France",
  "Brazil",
  "Argentina",
  "England",
  "Spain",
  "Italy",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Croatia",
  "Nigeria",
  "South Korea",
  "Mexico",
  "USA"
];

const COUNTRY_ALIASES = {
  jap: "Japan",
  jp: "Japan",
  german: "Germany",
  ger: "Germany",
  france: "France",
  fra: "France",
  brazil: "Brazil",
  bra: "Brazil",
  argentina: "Argentina",
  arg: "Argentina",
  england: "England",
  eng: "England",
  uk: "England",
  spain: "Spain",
  esp: "Spain",
  italy: "Italy",
  ita: "Italy",
  portugal: "Portugal",
  por: "Portugal",
  netherlands: "Netherlands",
  holland: "Netherlands",
  belgium: "Belgium",
  croatia: "Croatia",
  nigeria: "Nigeria",
  korea: "South Korea",
  skorea: "South Korea",
  mexico: "Mexico",
  usa: "USA",
  america: "USA"
};

/* =========================================================
   LEAGUES
========================================================= */

const LEAGUES = {
  PremierLeague: {
    name: "Premier League",
    country: "England",
    aliases: [
      "premier",
      "premier league",
      "epl",
      "england league"
    ]
  },

  LaLiga: {
    name: "La Liga",
    country: "Spain",
    aliases: [
      "laliga",
      "la liga",
      "liga",
      "spanish league"
    ]
  },

  Bundesliga: {
    name: "Bundesliga",
    country: "Germany",
    aliases: [
      "bundes",
      "bundesliga",
      "german league"
    ]
  },

  SerieA: {
    name: "Serie A",
    country: "Italy",
    aliases: [
      "serie a",
      "serie",
      "italian league"
    ]
  },

  Ligue1: {
    name: "Ligue 1",
    country: "France",
    aliases: [
      "ligue",
      "ligue 1",
      "french league"
    ]
  },

  Eredivisie: {
    name: "Eredivisie",
    country: "Netherlands",
    aliases: [
      "eredivisie",
      "ered",
      "dutch league"
    ]
  },

  LigaPortugal: {
    name: "Liga Portugal",
    country: "Portugal",
    aliases: [
      "liga portugal",
      "portuguese league",
      "portugal league"
    ]
  },

  NeoEgoistLeague: {
    name: "Neo Egoist League",
    country: "Japan",
    aliases: [
      "nel",
      "neo egoist",
      "neo egoist league",
      "blue lock league"
    ]
  },

  UCL: {
    name: "UEFA Champions League",
    country: "Europe",
    aliases: [
      "ucl",
      "champions",
      "champions league",
      "uefa champions league",
      "cl"
    ]
  },

  WorldCup: {
    name: "World Cup",
    country: "International",
    aliases: [
      "wc",
      "world cup",
      "worldcup",
      "world championship"
    ]
  }
};

/* =========================================================
   CLUBS
========================================================= */

const CLUBS = {
  "Real Madrid": {
    league: "LaLiga",
    country: "Spain",
    strength: 95,
    aliases: ["real", "madrid", "realmadrid", "rm"]
  },

  Barcelona: {
    league: "LaLiga",
    country: "Spain",
    strength: 92,
    aliases: ["barca", "barca", "fcbarcelona"]
  },

  "Atletico Madrid": {
    league: "LaLiga",
    country: "Spain",
    strength: 89,
    aliases: ["atletico", "atleti", "atm"]
  },

  "Manchester City": {
    league: "PremierLeague",
    country: "England",
    strength: 94,
    aliases: ["city", "mancity", "manchester city", "mc"]
  },

  Liverpool: {
    league: "PremierLeague",
    country: "England",
    strength: 92,
    aliases: ["liverpool", "lfc"]
  },

  Arsenal: {
    league: "PremierLeague",
    country: "England",
    strength: 91,
    aliases: ["arsenal", "gunners"]
  },

  "Manchester United": {
    league: "PremierLeague",
    country: "England",
    strength: 88,
    aliases: ["united", "manu", "manchesterunited", "mu"]
  },

  Chelsea: {
    league: "PremierLeague",
    country: "England",
    strength: 87,
    aliases: ["chelsea", "blues"]
  },

  "Bayern Munich": {
    league: "Bundesliga",
    country: "Germany",
    strength: 94,
    aliases: ["bayern", "munich", "fcbayern"]
  },

  "Borussia Dortmund": {
    league: "Bundesliga",
    country: "Germany",
    strength: 89,
    aliases: ["dortmund", "bvb"]
  },

  "Bayer Leverkusen": {
    league: "Bundesliga",
    country: "Germany",
    strength: 90,
    aliases: ["leverkusen", "bayer"]
  },

  "Inter Milan": {
    league: "SerieA",
    country: "Italy",
    strength: 91,
    aliases: ["inter", "intermilan", "internazionale"]
  },

  "AC Milan": {
    league: "SerieA",
    country: "Italy",
    strength: 88,
    aliases: ["milan", "acmilan"]
  },

  Juventus: {
    league: "SerieA",
    country: "Italy",
    strength: 89,
    aliases: ["juve", "juventus"]
  },

  PSG: {
    league: "Ligue1",
    country: "France",
    strength: 94,
    aliases: [
      "psg",
      "paris",
      "paris saint germain",
      "parissaintgermain"
    ]
  },

  Marseille: {
    league: "Ligue1",
    country: "France",
    strength: 84,
    aliases: ["om", "marseille"]
  },

  Ajax: {
    league: "Eredivisie",
    country: "Netherlands",
    strength: 84,
    aliases: ["ajax"]
  },

  PSV: {
    league: "Eredivisie",
    country: "Netherlands",
    strength: 85,
    aliases: ["psv"]
  },

  Benfica: {
    league: "LigaPortugal",
    country: "Portugal",
    strength: 87,
    aliases: ["benfica"]
  },

  Porto: {
    league: "LigaPortugal",
    country: "Portugal",
    strength: 86,
    aliases: ["porto", "fcporto"]
  },

  "Bastard München": {
    league: "NeoEgoistLeague",
    country: "Germany",
    strength: 97,
    aliases: [
      "bastard",
      "bastard munchen",
      "bastardmünchen",
      "bastardmunchen",
      "bm"
    ]
  },

  "Paris X Gen": {
    league: "NeoEgoistLeague",
    country: "France",
    strength: 96,
    aliases: [
      "pxg",
      "paris x gen",
      "parisxgen"
    ]
  },

  "Manshine City": {
    league: "NeoEgoistLeague",
    country: "England",
    strength: 91,
    aliases: [
      "manshine",
      "manshine city",
      "mc"
    ]
  },

  "FC Barcha": {
    league: "NeoEgoistLeague",
    country: "Spain",
    strength: 89,
    aliases: [
      "barcha",
      "fc barcha",
      "fcbarcha"
    ]
  },

  Ubers: {
    league: "NeoEgoistLeague",
    country: "Italy",
    strength: 92,
    aliases: [
      "uber",
      "ubers"
    ]
  }
};

/* =========================================================
   CHARACTERS
========================================================= */

const CHARACTERS = {
  isagi: {
    name: "Yoichi Isagi",
    rarity: "Legendary",
    position: "ST",
    country: "Japan",
    club: "Bastard München",
    rating: 91,
    aliases: [
      "isagi",
      "yoichi",
      "yoichi isagi"
    ],
    skills: [
      "Meta Vision",
      "Direct Shot",
      "Spatial Awareness",
      "Off-Ball Movement",
      "Two-Gun Volley",
      "Adaptation"
    ]
  },

  kaiser: {
    name: "Michael Kaiser",
    rarity: "Secret",
    position: "ST",
    country: "Germany",
    club: "Bastard München",
    rating: 98,
    aliases: [
      "kaiser",
      "michael",
      "michael kaiser",
      "mikey"
    ],
    skills: [
      "Kaiser Impact",
      "Kaiser Impact Magnus",
      "Meta Vision",
      "Predator Eye",
      "Elite Positioning",
      "Emperor's Aura"
    ]
  },

  rin: {
    name: "Rin Itoshi",
    rarity: "Mythic",
    position: "ST",
    country: "Japan",
    club: "Paris X Gen",
    rating: 96,
    aliases: [
      "rin",
      "itoshi rin",
      "rin itoshi"
    ],
    skills: [
      "Destroyer Mode",
      "Puppet Control",
      "Flow",
      "Curve Shot",
      "Spatial Reading",
      "Predator Instinct"
    ]
  },

  noa: {
    name: "Noel Noa",
    rarity: "Secret",
    position: "ST",
    country: "Germany",
    club: "Bastard München",
    rating: 99,
    aliases: [
      "noa",
      "noel",
      "noel noa"
    ],
    skills: [
      "Perfect Ambidexterity",
      "World Class Shooting",
      "Physical Mastery",
      "Adaptation",
      "Complete Striker",
      "World's Best"
    ]
  },

  loki: {
    name: "Julian Loki",
    rarity: "Mythic",
    position: "RW",
    country: "France",
    club: "Paris X Gen",
    rating: 97,
    aliases: [
      "loki",
      "julian",
      "julian loki"
    ],
    skills: [
      "Lightning Speed",
      "Explosive Acceleration",
      "Dribbling",
      "Speed Burst",
      "Counter Attack",
      "Godspeed"
    ]
  },

  lavinho: {
    name: "Lavinho",
    rarity: "Legendary",
    position: "LW",
    country: "Brazil",
    club: "FC Barcha",
    rating: 94,
    aliases: [
      "lavinho",
      "lav"
    ],
    skills: [
      "Creative Dribbling",
      "Elastic Dribble",
      "Brazilian Flair",
      "1v1 Mastery",
      "Technical Genius",
      "Magician"
    ]
  },

  bachira: {
    name: "Meguru Bachira",
    rarity: "Epic",
    position: "RW",
    country: "Japan",
    club: "FC Barcha",
    rating: 89,
    aliases: [
      "bachira",
      "meguru",
      "meguru bachira"
    ],
    skills: [
      "Monster",
      "Dribbling",
      "Elastic Dribble",
      "Creative Passing",
      "Flow",
      "Solo Run"
    ]
  },

  barou: {
    name: "Shoei Barou",
    rarity: "Epic",
    position: "ST",
    country: "Japan",
    club: "Ubers",
    rating: 90,
    aliases: [
      "barou",
      "shoei",
      "shoei barou"
    ],
    skills: [
      "Predator Eye",
      "Chop Feint",
      "Long Range Shot",
      "King's Presence",
      "Flow",
      "Charging Drive"
    ]
  },

  nagi: {
    name: "Seishiro Nagi",
    rarity: "Legendary",
    position: "ST",
    country: "Japan",
    club: "Manshine City",
    rating: 93,
    aliases: [
      "nagi",
      "seishiro",
      "seishiro nagi"
    ],
    skills: [
      "Perfect Trapping",
      "Five-Stage Revolver",
      "Trapping",
      "Creativity",
      "First Touch",
      "Lazy Genius"
    ]
  },

  reo: {
    name: "Reo Mikage",
    rarity: "Rare",
    position: "CM",
    country: "Japan",
    club: "Manshine City",
    rating: 86,
    aliases: [
      "reo",
      "mikage",
      "reo mikage"
    ],
    skills: [
      "Chameleon",
      "Copy",
      "Passing",
      "Adaptability",
      "Vision",
      "Versatility"
    ]
  }
};

/* =========================================================
   TROPHIES / AWARDS
========================================================= */

const TROPHIES = {
  ucl: "UEFA Champions League",
  champions: "UEFA Champions League",

  premierleague: "Premier League",
  laliga: "La Liga",
  bundesliga: "Bundesliga",
  seriea: "Serie A",
  ligue1: "Ligue 1",

  worldcup: "World Cup",
  wc: "World Cup",

  copa: "Continental Cup",

  ballondor: "Ballon d'Or",
  ballon: "Ballon d'Or",

  goldenboot: "Golden Boot",
  boot: "Golden Boot",

  goldenglove: "Golden Glove",
  glove: "Golden Glove",

  mvp: "Season MVP"
};

const TROPHY_ALIASES = Object.keys(TROPHIES);

/* =========================================================
   SMART MATCHING
========================================================= */

function similarityScore(input, candidate) {
  const a = normalize(input);
  const b = normalize(candidate);

  if (!a || !b) return 0;

  if (a === b) return 100;

  if (b.includes(a)) return 85;
  if (a.includes(b)) return 80;

  let same = 0;

  for (const char of a) {
    if (b.includes(char)) same++;
  }

  return Math.floor((same / Math.max(a.length, b.length)) * 70);
}

function smartFind(input, database, aliasesGetter) {
  if (!input) return null;

  const query = normalize(input);

  let best = null;
  let bestScore = 0;

  for (const [key, value] of Object.entries(database)) {
    const names = [
      key,
      value.name || "",
      ...(aliasesGetter(value) || [])
    ];

    for (const name of names) {
      const score = similarityScore(query, name);

      if (score > bestScore) {
        bestScore = score;
        best = key;
      }
    }
  }

  return bestScore >= 45 ? best : null;
}

function findCharacter(input) {
  return smartFind(
    input,
    CHARACTERS,
    char => char.aliases
  );
}

function findClub(input) {
  return smartFind(
    input,
    CLUBS,
    club => club.aliases
  );
}

function findLeague(input) {
  return smartFind(
    input,
    LEAGUES,
    league => league.aliases
  );
}

function findCountry(input) {
  if (!input) return null;

  const direct = COUNTRY_ALIASES[normalize(input)];

  if (direct) return direct;

  let best = null;
  let score = 0;

  for (const country of COUNTRIES) {
    const current = similarityScore(input, country);

    if (current > score) {
      score = current;
      best = country;
    }
  }

  return score >= 50 ? best : null;
}

function findTrophy(input) {
  if (!input) return null;

  const query = normalize(input);

  if (TROPHIES[query]) {
    return TROPHIES[query];
  }

  let best = null;
  let score = 0;

  for (const alias of TROPHY_ALIASES) {
    const current = similarityScore(query, alias);

    if (current > score) {
      score = current;
      best = TROPHIES[alias];
    }
  }

  return score >= 45 ? best : null;
}

/* =========================================================
   USER DATA
========================================================= */

function getUser(id) {
  if (!db.users[id]) {
    db.users[id] = {
      id,

      coins: 5000,
      gems: 100,

      level: 1,
      xp: 0,

      rating: 75,
      position: "ST",

      career: "Rookie",

      country: "Japan",

      club: "Blue Lock",

      activeCharacter: null,
      characters: [],

      stats: {
        matches: 0,
        appearances: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        cleanSheets: 0
      },

      seasonStats: {
        appearances: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        losses: 0,
        ratingSum: 0
      },

      trophies: [],
      awards: [],

      transferValue: 1000000,

      contract: {
        club: null,
        expires: 1
      },

      clubInterest: {},

      offers: [],

      history: [],

      cooldowns: {}
    };
  }

  return db.users[id];
}

/* =========================================================
   XP / LEVEL
========================================================= */

function addXP(player, amount) {
  player.xp += amount;

  let levels = 0;

  while (player.xp >= xpRequired(player.level)) {
    player.xp -= xpRequired(player.level);
    player.level++;
    levels++;
  }

  return levels;
}

/* =========================================================
   COOLDOWNS
========================================================= */

function onCooldown(player, command, seconds) {
  const last = player.cooldowns[command] || 0;

  return Date.now() - last < seconds * 1000;
}

function cooldownRemaining(player, command, seconds) {
  const last = player.cooldowns[command] || 0;

  return Math.max(
    0,
    Math.ceil(
      (seconds * 1000 - (Date.now() - last)) / 1000
    )
  );
}

function useCooldown(player, command) {
  player.cooldowns[command] = Date.now();
}

/* =========================================================
   RARITY / GACHA
========================================================= */

function rollRarity() {
  const roll = Math.random() * 100;
  let current = 0;

  for (const [rarity, chance] of Object.entries(RARITIES)) {
    current += chance;

    if (roll <= current) {
      return rarity;
    }
  }

  return "Common";
}

function rollCharacter() {
  const rarity = rollRarity();

  const choices = Object.entries(CHARACTERS)
    .filter(([_, character]) =>
      character.rarity === rarity
    );

  if (!choices.length) {
    const all = Object.entries(CHARACTERS);

    return all[random(0, all.length - 1)];
  }

  return choices[random(0, choices.length - 1)];
}

/* =========================================================
   MATCH PERFORMANCE
========================================================= */

function calculateMatchPerformance(player, opponentStrength) {
  const character = player.activeCharacter
    ? CHARACTERS[player.activeCharacter]
    : null;

  const characterBonus = character
    ? Math.max(0, character.rating - 75) * 0.15
    : 0;

  const power =
    player.rating +
    characterBonus +
    randomFloat(-5, 5);

  const opponent =
    opponentStrength +
    randomFloat(-5, 5);

  const difference = power - opponent;

  let result;

  if (difference >= 12) {
    result = "win";
  } else if (difference <= -12) {
    result = "loss";
  } else {
    const chance = Math.random();

    if (chance < 0.47) result = "win";
    else if (chance < 0.88) result = "loss";
    else result = "draw";
  }

  let goals = 0;
  let assists = 0;

  if (result === "win") {
    goals = random(1, 4);
    assists = random(0, 2);
  } else if (result === "draw") {
    goals = random(0, 2);
    assists = random(0, 2);
  } else {
    goals = random(0, 2);
    assists = random(0, 1);
  }

  /*
     Performance rating is based on what the player actually did.
  */

  let matchRating = 6.0;

  matchRating += goals * 1.15;
  matchRating += assists * 0.65;

  if (result === "win") {
    matchRating += 0.8;
  } else if (result === "draw") {
    matchRating += 0.2;
  } else {
    matchRating -= 0.4;
  }

  matchRating += randomFloat(-0.35, 0.35);

  matchRating = Math.max(
    4.5,
    Math.min(10, matchRating)
  );

  matchRating = Number(matchRating.toFixed(1));

  /*
     Improvement is based on performance.
  */

  let ratingChange = 0;

  if (matchRating >= 9.5) {
    ratingChange = random(2, 3);
  } else if (matchRating >= 8.5) {
    ratingChange = random(1, 2);
  } else if (matchRating >= 7.5) {
    ratingChange = random(0, 1);
  } else if (matchRating < 6) {
    ratingChange = -1;
  }

  /*
     XP / money rewards
  */

  let xp = 25 + Math.round(matchRating * 5);

  if (result === "win") {
    xp += 25;
  }

  if (goals > 0) {
    xp += goals * 15;
  }

  if (assists > 0) {
    xp += assists * 10;
  }

  const coins =
    random(500, 1300) +
    goals * 350 +
    assists * 200 +
    (result === "win" ? 700 : 0);

  return {
    result,
    goals,
    assists,
    matchRating,
    ratingChange,
    xp,
    coins
  };
}

/* =========================================================
   CLUB INTEREST
========================================================= */

function calculateInterest(player, match) {
  const interest = [];

  for (const [clubName, club] of Object.entries(CLUBS)) {
    if (clubName === player.club) continue;

    let score = 0;

    /*
       Match performance
    */

    score += (match.matchRating - 5) * 8;

    score += match.goals * 7;
    score += match.assists * 4;

    /*
       Player rating
    */

    score += Math.max(
      0,
      player.rating - club.strength + 15
    );

    /*
       Season reputation
    */

    score += Math.min(
      20,
      player.seasonStats.goals * 0.6
    );

    score += Math.min(
      10,
      player.seasonStats.assists * 0.4
    );

    /*
       Trophies
    */

    score += player.trophies.length * 1.5;

    /*
       Better clubs require more reputation.
    */

    const requirement =
      club.strength >= 94 ? 75 :
      club.strength >= 90 ? 60 :
      45;

    if (score >= requirement) {
      let level;

      if (score >= 100) {
        level = "Very High";
      } else if (score >= 80) {
        level = "High";
      } else if (score >= 60) {
        level = "Medium";
      } else {
        level = "Low";
      }

      interest.push({
        club: clubName,
        score,
        level
      });

      player.clubInterest[clubName] = {
        score,
        level,
        lastUpdated: Date.now()
      };
    }
  }

  interest.sort((a, b) => b.score - a.score);

  return interest.slice(0, 5);
}

/* =========================================================
   TRANSFER OFFERS
========================================================= */

function generateTransferOffers(player, interest) {
  const newOffers = [];

  for (const item of interest) {
    if (item.level !== "High" &&
        item.level !== "Very High") {
      continue;
    }

    /*
       Don't spam offers every match.
    */

    if (Math.random() > 0.28) continue;

    const club = CLUBS[item.club];

    const transferFee = Math.max(
      player.transferValue,
      Math.round(
        player.transferValue *
        randomFloat(1.0, 2.2)
      )
    );

    const salary = Math.round(
      Math.max(
        10000,
        player.rating * random(1500, 4500)
      )
    );

    const offer = {
      id: `${Date.now()}_${random(1000, 9999)}`,
      club: item.club,
      fee: transferFee,
      salary,
      seasons: random(2, 5),
      status: "pending",
      created: Date.now()
    };

    player.offers.push(offer);
    newOffers.push(offer);
  }

  return newOffers;
}

/* =========================================================
   MATCH
========================================================= */

async function playMatch(player, opponentName = null) {
  const opponentClub =
    opponentName && findClub(opponentName)
      ? findClub(opponentName)
      : null;

  let opponentStrength;

  if (opponentClub) {
    opponentStrength = CLUBS[opponentClub].strength;
  } else {
    opponentStrength = random(75, 96);
  }

  const oldRating = player.rating;
  const oldLevel = player.level;

  const match = calculateMatchPerformance(
    player,
    opponentStrength
  );

  player.stats.matches++;
  player.stats.appearances++;

  player.stats.goals += match.goals;
  player.stats.assists += match.assists;

  player.seasonStats.appearances++;
  player.seasonStats.goals += match.goals;
  player.seasonStats.assists += match.assists;
  player.seasonStats.ratingSum += match.matchRating;

  if (match.result === "win") {
    player.stats.wins++;
    player.seasonStats.wins++;
  }

  if (match.result === "draw") {
    player.stats.draws++;
  }

  if (match.result === "loss") {
    player.stats.losses++;
    player.seasonStats.losses++;
  }

  player.rating = Math.max(
    50,
    Math.min(
      99,
      player.rating + match.ratingChange
    )
  );

  player.coins += match.coins;

  const levels = addXP(player, match.xp);

  player.transferValue = Math.max(
    100000,
    Math.round(
      player.transferValue *
      (1 + Math.max(-0.03, match.ratingChange * 0.025))
    )
  );

  const interest = calculateInterest(
    player,
    match
  );

  const offers = generateTransferOffers(
    player,
    interest
  );

  player.history.push({
    type: "match",
    season: db.seasons.current,
    result: match.result,
    goals: match.goals,
    assists: match.assists,
    rating: match.matchRating,
    ratingChange: match.ratingChange,
    timestamp: Date.now()
  });

  saveDB();

  return {
    match,
    oldRating,
    newRating: player.rating,
    oldLevel,
    newLevel: player.level,
    levels,
    interest,
    offers
  };
}

/* =========================================================
   TROPHY
========================================================= */

function giveTrophy(player, trophy) {
  if (!player.trophies.includes(trophy)) {
    player.trophies.push(trophy);
    return true;
  }

  return false;
}

/* =========================================================
   SEASON
========================================================= */

function startNewSeason() {
  const previous = db.seasons.current;

  db.seasons.history.push({
    season: previous,
    completedAt: Date.now()
  });

  db.seasons.current++;

  for (const player of Object.values(db.users)) {
    player.seasonStats = {
      appearances: 0,
      goals: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      ratingSum: 0
    };

    player.clubInterest = {};

    for (const offer of player.offers) {
      if (offer.status === "pending") {
        offer.status = "expired";
      }
    }

    player.contract.expires =
      Math.max(
        player.contract.expires,
        db.seasons.current
      );
  }

  saveDB();

  return db.seasons.current;
}

/* =========================================================
   EMBED
========================================================= */

function makeEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/* =========================================================
   RESPONSE
========================================================= */

async function respond(context, payload) {
  if (context.isInteraction) {
    if (context.replied || context.deferred) {
      return context.followUp(payload);
    }

    return context.reply(payload);
  }

  return context.reply(payload);
}

/* =========================================================
   COMMAND EXECUTION
========================================================= */

async function executeCommand(command, args, context) {
  const isInteraction = context.isInteraction;

  const user = isInteraction
    ? context.user
    : context.author;

  const player = getUser(user.id);

  /* =======================================================
     PROFILE
  ======================================================= */

  if (command === "profile") {
    let target = user;

    if (isInteraction) {
      target =
        context.options.getUser("user") ||
        user;
    }

    const targetPlayer = getUser(target.id);

    const character =
      targetPlayer.activeCharacter
        ? CHARACTERS[targetPlayer.activeCharacter]
        : null;

    return respond(context, {
      embeds: [
        makeEmbed(
          `${target.username}'s Career`,
          [
            `**Season:** ${db.seasons.current}`,
            `**Level:** ${targetPlayer.level}`,
            `**XP:** ${targetPlayer.xp}/${xpRequired(targetPlayer.level)}`,
            `**OVR:** ${targetPlayer.rating}`,
            `**Position:** ${targetPlayer.position}`,
            `**Career:** ${targetPlayer.career}`,
            `**Country:** ${targetPlayer.country}`,
            `**Club:** ${targetPlayer.club}`,
            `**Transfer Value:** ¥${formatNumber(targetPlayer.transferValue)}`,
            "",
            `**Character:** ${character ? character.name : "None"}`,
            "",
            `⚽ Goals: ${targetPlayer.stats.goals}`,
            `🅰️ Assists: ${targetPlayer.stats.assists}`,
            `🎮 Matches: ${targetPlayer.stats.matches}`,
            `🏆 Trophies: ${targetPlayer.trophies.length}`
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     ROLL
  ======================================================= */

  if (command === "roll") {
    if (onCooldown(player, "roll", 15)) {
      return respond(
        context,
        `You can roll again in **${cooldownRemaining(player, "roll", 15)}s**.`
      );
    }

    useCooldown(player, "roll");

    const [id, character] = rollCharacter();

    const duplicate =
      player.characters.includes(id);

    if (!duplicate) {
      player.characters.push(id);
    } else {
      player.coins += 1000;
    }

    saveDB();

    return respond(context, {
      embeds: [
        makeEmbed(
          "Character Roll",
          [
            `**${character.name}**`,
            "",
            `Rarity: **${character.rarity}**`,
            `Rating: **${character.rating}**`,
            `Position: **${character.position}**`,
            `Country: **${character.country}**`,
            `Club: **${character.club}**`,
            "",
            duplicate
              ? "Duplicate → **+1,000 coins**"
              : "New character added to your collection."
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     CHARACTERS
  ======================================================= */

  if (command === "characters") {
    if (!player.characters.length) {
      return respond(
        context,
        "You don't have any characters yet. Use `,roll`."
      );
    }

    const list = player.characters
      .map(id => {
        const c = CHARACTERS[id];

        return c
          ? `**${c.name}** — ${c.rarity} — ${c.rating} OVR`
          : id;
      })
      .join("\n");

    return respond(context, {
      embeds: [
        makeEmbed(
          `${user.username}'s Characters`,
          list
        )
      ]
    });
  }

  /* =======================================================
     CHARACTER
  ======================================================= */

  if (command === "character") {
    const input = isInteraction
      ? context.options.getString("name")
      : args.join(" ");

    const id = findCharacter(input);

    if (!id) {
      return respond(
        context,
        "I couldn't find that character."
      );
    }

    const c = CHARACTERS[id];

    return respond(context, {
      embeds: [
        makeEmbed(
          c.name,
          [
            `**Rarity:** ${c.rarity}`,
            `**OVR:** ${c.rating}`,
            `**Position:** ${c.position}`,
            `**Country:** ${c.country}`,
            `**Club:** ${c.club}`,
            "",
            "**Abilities**",
            ...c.skills.map(
              (skill, i) => `${i + 1}. ${skill}`
            )
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     SET CHARACTER
  ======================================================= */

  if (command === "setcharacter") {
    const input = isInteraction
      ? context.options.getString("name")
      : args.join(" ");

    const id = findCharacter(input);

    if (!id) {
      return respond(
        context,
        "I couldn't find that character."
      );
    }

    if (!player.characters.includes(id)) {
      return respond(
        context,
        `You don't own **${CHARACTERS[id].name}**.`
      );
    }

    player.activeCharacter = id;

    saveDB();

    return respond(
      context,
      `Equipped **${CHARACTERS[id].name}**.`
    );
  }

  /* =======================================================
     STATS
  ======================================================= */

  if (command === "stats") {
    const averageRating =
      player.seasonStats.appearances
        ? (
            player.seasonStats.ratingSum /
            player.seasonStats.appearances
          ).toFixed(1)
        : "N/A";

    return respond(context, {
      embeds: [
        makeEmbed(
          "Career Statistics",
          [
            `**Matches:** ${player.stats.matches}`,
            `**Appearances:** ${player.stats.appearances}`,
            `**Goals:** ${player.stats.goals}`,
            `**Assists:** ${player.stats.assists}`,
            `**Wins:** ${player.stats.wins}`,
            `**Draws:** ${player.stats.draws}`,
            `**Losses:** ${player.stats.losses}`,
            "",
            `**Season ${db.seasons.current}**`,
            `Goals: ${player.seasonStats.goals}`,
            `Assists: ${player.seasonStats.assists}`,
            `Appearances: ${player.seasonStats.appearances}`,
            `Average Rating: ${averageRating}`
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     BALANCE
  ======================================================= */

  if (command === "balance") {
    return respond(
      context,
      `**Coins:** ${formatNumber(player.coins)}\n**Gems:** ${formatNumber(player.gems)}`
    );
  }

  /* =======================================================
     CLUBS
  ======================================================= */

  if (command === "clubs") {
    const list = Object.entries(CLUBS)
      .map(
        ([name, data]) =>
          `**${name}** — ${data.strength} OVR — ${LEAGUES[data.league]?.name || data.league}`
      )
      .join("\n");

    return respond(context, {
      embeds: [
        makeEmbed(
          "Available Clubs",
          list
        )
      ]
    });
  }

  /* =======================================================
     LEAGUES
  ======================================================= */

  if (command === "leagues") {
    const list = Object.entries(LEAGUES)
      .map(
        ([_, league]) =>
          `**${league.name}** — ${league.country}`
      )
      .join("\n");

    return respond(context, {
      embeds: [
        makeEmbed(
          "Competitions",
          list
        )
      ]
    });
  }

  /* =======================================================
     COUNTRIES
  ======================================================= */

  if (command === "countries") {
    return respond(
      context,
      COUNTRIES.map(x => `• ${x}`).join("\n")
    );
  }

  /* =======================================================
     CAREER
  ======================================================= */

  if (command === "career") {
    return respond(context, {
      embeds: [
        makeEmbed(
          "Career",
          [
            `**Career Level:** ${player.career}`,
            `**OVR:** ${player.rating}`,
            `**Level:** ${player.level}`,
            `**Club:** ${player.club}`,
            `**Country:** ${player.country}`,
            `**Transfer Value:** ¥${formatNumber(player.transferValue)}`,
            `**Contract Until:** Season ${player.contract.expires}`
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     TROPHIES
  ======================================================= */

  if (command === "trophies") {
    if (!player.trophies.length) {
      return respond(
        context,
        "Your trophy cabinet is empty."
      );
    }

    return respond(context, {
      embeds: [
        makeEmbed(
          "Trophy Cabinet",
          player.trophies
            .map(x => `🏆 **${x}**`)
            .join("\n")
        )
      ]
    });
  }

  /* =======================================================
     MATCH
  ======================================================= */

  if (command === "match") {
    if (onCooldown(player, "match", 10)) {
      return respond(
        context,
        `You can play again in **${cooldownRemaining(player, "match", 10)}s**.`
      );
    }

    useCooldown(player, "match");

    const opponentInput = isInteraction
      ? context.options?.getString?.("opponent")
      : args.join(" ");

    const result = await playMatch(
      player,
      opponentInput || null
    );

    const match = result.match;

    const resultText =
      match.result === "win"
        ? "VICTORY"
        : match.result === "draw"
          ? "DRAW"
          : "DEFEAT";

    let description = [
      `## ${resultText}`,
      "",
      `⚽ **Goals:** ${match.goals}`,
      `🅰️ **Assists:** ${match.assists}`,
      `⭐ **Match Rating:** ${match.matchRating}`,
      "",
      `📈 **OVR:** ${result.oldRating} → ${result.newRating}`,
      `${match.ratingChange >= 0 ? "+" : ""}${match.ratingChange} OVR`,
      "",
      `✨ **XP:** +${match.xp}`,
      `💰 **Coins:** +${formatNumber(match.coins)}`
    ];

    if (result.newLevel > result.oldLevel) {
      description.push(
        "",
        `🎉 **LEVEL UP!**`,
        `Level ${result.oldLevel} → ${result.newLevel}`
      );
    }

    if (result.interest.length) {
      description.push(
        "",
        "## Club Interest"
      );

      for (const item of result.interest) {
        description.push(
          `• **${item.club}** — ${item.level}`
        );
      }
    }

    if (result.offers.length) {
      description.push(
        "",
        "## New Transfer Offer"
      );

      for (const offer of result.offers) {
        description.push(
          `📨 **${offer.club}** — ¥${formatNumber(offer.fee)}`
        );
      }

      description.push(
        "",
        "Use `,offers` to view your offers."
      );
    }

    return respond(context, {
      embeds: [
        makeEmbed(
          `Match Report — Season ${db.seasons.current}`,
          description.join("\n")
        )
      ]
    });
  }

  /* =======================================================
     INTEREST
  ======================================================= */

  if (command === "interest") {
    const entries = Object.entries(
      player.clubInterest
    )
      .sort(
        ([_, a], [__, b]) =>
          b.score - a.score
      )
      .slice(0, 10);

    if (!entries.length) {
      return respond(
        context,
        "No clubs are currently interested in you. Keep performing well."
      );
    }

    return respond(context, {
      embeds: [
        makeEmbed(
          "Club Interest",
          entries
            .map(
              ([club, data]) =>
                `**${club}** — ${data.level}`
            )
            .join("\n")
        )
      ]
    });
  }

  /* =======================================================
     OFFERS
  ======================================================= */

  if (command === "offers") {
    const offers = player.offers.filter(
      x => x.status === "pending"
    );

    if (!offers.length) {
      return respond(
        context,
        "You don't have any pending transfer offers."
      );
    }

    const list = offers
      .map(
        offer =>
          `**${offer.id}**\n` +
          `Club: **${offer.club}**\n` +
          `Fee: **¥${formatNumber(offer.fee)}**\n` +
          `Salary: **¥${formatNumber(offer.salary)}**\n` +
          `Contract: **${offer.seasons} seasons**`
      )
      .join("\n\n");

    return respond(context, {
      embeds: [
        makeEmbed(
          "Transfer Offers",
          list +
            "\n\nAccept with `,acceptoffer <ID>`"
        )
      ]
    });
  }

  /* =======================================================
     ACCEPT OFFER
  ======================================================= */

  if (command === "acceptoffer") {
    const id = isInteraction
      ? context.options.getString("id")
      : args[0];

    const offer = player.offers.find(
      x =>
        x.id === id &&
        x.status === "pending"
    );

    if (!offer) {
      return respond(
        context,
        "That transfer offer doesn't exist or has expired."
      );
    }

    player.club = offer.club;

    player.contract = {
      club: offer.club,
      expires: db.seasons.current + offer.seasons
    };

    player.transferValue = Math.max(
      player.transferValue,
      offer.fee
    );

    offer.status = "accepted";

    player.history.push({
      type: "transfer",
      from: player.club,
      to: offer.club,
      season: db.seasons.current,
      timestamp: Date.now()
    });

    saveDB();

    return respond(
      context,
      `Transfer accepted.\n\nYou are now playing for **${offer.club}**.`
    );
  }

  /* =======================================================
     TRANSFER MANUALLY
  ======================================================= */

  if (command === "transfer") {
    const input = isInteraction
      ? context.options.getString("club")
      : args.join(" ");

    const club = findClub(input);

    if (!club) {
      return respond(
        context,
        "I couldn't find that club."
      );
    }

    const data = CLUBS[club];

    if (club === player.club) {
      return respond(
        context,
        `You're already at **${club}**.`
      );
    }

    if (player.rating + 5 < data.strength) {
      return respond(
        context,
        [
          `**${club}** isn't currently willing to sign you.`,
          "",
          `Your OVR: **${player.rating}**`,
          `Club level: **${data.strength}**`,
          "",
          "Keep performing well to attract them."
        ].join("\n")
      );
    }

    const oldClub = player.club;

    player.club = club;

    player.contract = {
      club,
      expires: db.seasons.current + random(2, 4)
    };

    player.transferValue += random(
      500000,
      5000000
    );

    player.history.push({
      type: "transfer",
      from: oldClub,
      to: club,
      season: db.seasons.current,
      timestamp: Date.now()
    });

    saveDB();

    return respond(
      context,
      `Transfer completed.\n\n**${oldClub}** → **${club}**`
    );
  }

  /* =======================================================
     LEAGUE
  ======================================================= */

  if (command === "league") {
    const input = isInteraction
      ? context.options.getString("name")
      : args.join(" ");

    const league = findLeague(input);

    if (!league) {
      return respond(
        context,
        "I couldn't find that competition."
      );
    }

    if (league === "UCL") {
      return respond(context, {
        embeds: [
          makeEmbed(
            "UEFA Champions League",
            [
              "**Competition Structure**",
              "",
              "• League/Group Stage",
              "• Knockout Stage",
              "• Round of 16",
              "• Quarter-Finals",
              "• Semi-Finals",
              "• Final",
              "",
              "🏆 Winner receives the UCL trophy."
            ].join("\n")
          )
        ]
      });
    }

    if (league === "WorldCup") {
      return respond(context, {
        embeds: [
          makeEmbed(
            "World Cup",
            "International tournament for national teams.\n\n🏆 Winner receives the World Cup."
          )
        ]
      });
    }

    const clubs = Object.entries(CLUBS)
      .filter(
        ([_, club]) =>
          club.league === league
      )
      .map(([name, club]) => ({
        name,
        strength: club.strength,
        points: random(15, 30)
      }))
      .sort((a, b) => b.points - a.points);

    const table = clubs
      .map(
        (club, index) =>
          `**${index + 1}. ${club.name}** — ${club.points} pts`
      )
      .join("\n");

    return respond(context, {
      embeds: [
        makeEmbed(
          `${LEAGUES[league].name} — Season ${db.seasons.current}`,
          table || "No clubs available."
        )
      ]
    });
  }

  /* =======================================================
     SEASON
  ======================================================= */

  if (command === "season") {
    return respond(context, {
      embeds: [
        makeEmbed(
          `Season ${db.seasons.current}`,
          [
            "**Competitions**",
            "• Domestic Leagues",
            "• UEFA Champions League",
            "• Continental Cups",
            "• World Cup",
            "",
            "**Individual Awards**",
            "• Ballon d'Or",
            "• Golden Boot",
            "• Golden Glove",
            "• Season MVP",
            "",
            `Completed Seasons: **${db.seasons.history.length}**`
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     DAILY
  ======================================================= */

  if (command === "daily") {
    if (onCooldown(player, "daily", 86400)) {
      return respond(
        context,
        `Daily reward available in **${cooldownRemaining(player, "daily", 86400)}s**.`
      );
    }

    useCooldown(player, "daily");

    const coins = random(1000, 3000);
    const gems = random(5, 20);

    player.coins += coins;
    player.gems += gems;

    saveDB();

    return respond(
      context,
      `Daily reward:\n\n**+${formatNumber(coins)} coins**\n**+${gems} gems**`
    );
  }

  /* =======================================================
     LEADERBOARD
  ======================================================= */

  if (command === "leaderboard") {
    const users = Object.values(db.users)
      .sort(
        (a, b) =>
          b.rating - a.rating ||
          b.stats.goals - a.stats.goals
      )
      .slice(0, 10);

    const lines = [];

    for (let i = 0; i < users.length; i++) {
      const member = await client.users
        .fetch(users[i].id)
        .catch(() => null);

      lines.push(
        `**${i + 1}.** ${member?.username || users[i].id} — ${users[i].rating} OVR`
      );
    }

    return respond(context, {
      embeds: [
        makeEmbed(
          "World Ranking",
          lines.join("\n") || "No players."
        )
      ]
    });
  }

  /* =======================================================
     HELP
  ======================================================= */

  if (command === "help") {
    return respond(context, {
      embeds: [
        makeEmbed(
          "Blue Lock Football RPG",
          [
            "**PROFILE**",
            "`,profile`",
            "`,stats`",
            "`,balance`",
            "`,career`",
            "`,trophies`",
            "",
            "**CHARACTERS**",
            "`,roll`",
            "`,characters`",
            "`,character <name>`",
            "`,setcharacter <name>`",
            "",
            "**FOOTBALL**",
            "`,match`",
            "`,clubs`",
            "`,leagues`",
            "`,league <name>`",
            "`,season`",
            "`,transfer <club>`",
            "`,interest`",
            "`,offers`",
            "`,acceptoffer <id>`",
            "",
            "**REWARDS**",
            "`,daily`",
            "`,leaderboard`",
            "",
            "**OWNER**",
            "`,ownerhelp`"
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     OWNER HELP
  ======================================================= */

  if (command === "ownerhelp") {
    if (!ownerOnly(user.id)) {
      return respond(
        context,
        "You are not authorized to use owner commands."
      );
    }

    return respond(context, {
      embeds: [
        makeEmbed(
          "Owner Commands",
          [
            "`,rob`",
            "`,givecoins @user amount`",
            "`,givegems @user amount`",
            "`,givechar @user character`",
            "`,removechar @user character`",
            "`,giveall @user`",
            "`,setlevel @user level`",
            "`,setxp @user xp`",
            "`,setrating @user rating`",
            "`,setclub @user club`",
            "`,setcountry @user country`",
            "`,setcareer @user career`",
            "`,givetrophy @user trophy`",
            "`,resetplayer @user`",
            "`,newseason`"
          ].join("\n")
        )
      ]
    });
  }

  /* =======================================================
     OWNER: ROB
  ======================================================= */

  if (command === "rob") {
    if (!ownerOnly(user.id)) {
      return respond(
        context,
        "You are not authorized to use this command."
      );
    }

    player.coins += 1000000000;
    player.gems += 100000;
    player.rating = 99;
    player.level = Math.max(
      player.level,
      100
    );

    saveDB();

    return respond(
      context,
      [
        "Owner reward activated.",
        "",
        "**+1,000,000,000 coins**",
        "**+100,000 gems**",
        "**99 OVR**",
        "**Level 100**"
      ].join("\n")
    );
  }

  /* =======================================================
     OWNER: TARGET COMMANDS
  ======================================================= */

  const ownerCommands = [
    "givecoins",
    "givegems",
    "givechar",
    "removechar",
    "giveall",
    "setlevel",
    "setxp",
    "setrating",
    "setclub",
    "setcountry",
    "setcareer",
    "givetrophy",
    "resetplayer",
    "newseason"
  ];

  if (ownerCommands.includes(command)) {
    if (!ownerOnly(user.id)) {
      return respond(
        context,
        "You are not authorized to use owner commands."
      );
    }

    if (command === "newseason") {
      const season = startNewSeason();

      return respond(
        context,
        `New season started: **Season ${season}**`
      );
    }

    let target;

    if (isInteraction) {
      target = context.options.getUser("user");
    } else {
      target =
        context.mentions.users.first();
    }

    if (!target) {
      return respond(
        context,
        "You must mention a target player."
      );
    }

    const targetPlayer = getUser(target.id);

    let value;

    if (isInteraction) {
      value =
        context.options.getString("value") ||
        String(
          context.options.getInteger("amount") || ""
        );
    } else {
      value = args.slice(1).join(" ");
    }

    if (command === "givecoins") {
      const amount = Number(value);

      if (!Number.isFinite(amount) || amount <= 0) {
        return respond(
          context,
          "Enter a valid amount."
        );
      }

      targetPlayer.coins += amount;

      saveDB();

      return respond(
        context,
        `Gave **${formatNumber(amount)} coins** to ${target}.`
      );
    }

    if (command === "givegems") {
      const amount = Number(value);

      if (!Number.isFinite(amount) || amount <= 0) {
        return respond(
          context,
          "Enter a valid amount."
        );
      }

      targetPlayer.gems += amount;

      saveDB();

      return respond(
        context,
        `Gave **${formatNumber(amount)} gems** to ${target}.`
      );
    }

    if (command === "givechar") {
      const id = findCharacter(value);

      if (!id) {
        return respond(
          context,
          "I couldn't find that character."
        );
      }

      if (!targetPlayer.characters.includes(id)) {
        targetPlayer.characters.push(id);
      }

      saveDB();

      return respond(
        context,
        `Gave **${CHARACTERS[id].name}** to ${target}.`
      );
    }

    if (command === "removechar") {
      const id = findCharacter(value);

      if (!id) {
        return respond(
          context,
          "I couldn't find that character."
        );
      }

      targetPlayer.characters =
        targetPlayer.characters.filter(
          x => x !== id
        );

      if (targetPlayer.activeCharacter === id) {
        targetPlayer.activeCharacter = null;
      }

      saveDB();

      return respond(
        context,
        `Removed **${CHARACTERS[id].name}** from ${target}.`
      );
    }

    if (command === "giveall") {
      for (const id of Object.keys(CHARACTERS)) {
        if (!targetPlayer.characters.includes(id)) {
          targetPlayer.characters.push(id);
        }
      }

      targetPlayer.coins += 1000000;
      targetPlayer.gems += 10000;
      targetPlayer.rating = 99;

      saveDB();

      return respond(
        context,
        `Gave ${target} **all characters**, 1,000,000 coins, 10,000 gems and 99 OVR.`
      );
    }

    if (command === "setlevel") {
      const level = Number(value);

      if (!Number.isFinite(level) || level < 1) {
        return respond(
          context,
          "Invalid level."
        );
      }

      targetPlayer.level = Math.floor(level);

      saveDB();

      return respond(
        context,
        `Set ${target}'s level to **${targetPlayer.level}**.`
      );
    }

    if (command === "setxp") {
      const xp = Number(value);

      if (!Number.isFinite(xp) || xp < 0) {
        return respond(
          context,
          "Invalid XP."
        );
      }

      targetPlayer.xp = Math.floor(xp);

      saveDB();

      return respond(
        context,
        `Set ${target}'s XP to **${targetPlayer.xp}**.`
      );
    }

    if (command === "setrating") {
      const rating = Number(value);

      if (
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 99
      ) {
        return respond(
          context,
          "Rating must be between 1 and 99."
        );
      }

      targetPlayer.rating = Math.floor(rating);

      saveDB();

      return respond(
        context,
        `Set ${target}'s rating to **${targetPlayer.rating} OVR**.`
      );
    }

    if (command === "setclub") {
      const club = findClub(value);

      if (!club) {
        return respond(
          context,
          "I couldn't find that club."
        );
      }

      targetPlayer.club = club;

      targetPlayer.contract = {
        club,
        expires: db.seasons.current + 3
      };

      saveDB();

      return respond(
        context,
        `Set ${target}'s club to **${club}**.`
      );
    }

    if (command === "setcountry") {
      const country = findCountry(value);

      if (!country) {
        return respond(
          context,
          "I couldn't find that country."
        );
      }

      targetPlayer.country = country;

      saveDB();

      return respond(
        context,
        `Set ${target}'s country to **${country}**.`
      );
    }

    if (command === "setcareer") {
      if (!value) {
        return respond(
          context,
          "Enter a career level."
        );
      }

      targetPlayer.career = value;

      saveDB();

      return respond(
        context,
        `Set ${target}'s career to **${value}**.`
      );
    }

    if (command === "givetrophy") {
      const trophy = findTrophy(value);

      if (!trophy) {
        return respond(
          context,
          "I couldn't find that trophy."
        );
      }

      giveTrophy(
        targetPlayer,
        trophy
      );

      saveDB();

      return respond(
        context,
        `Gave **${trophy}** to ${target}.`
      );
    }

    if (command === "resetplayer") {
      delete db.users[target.id];

      saveDB();

      return respond(
        context,
        `Reset ${target}'s RPG profile.`
      );
    }
  }
}

/* =========================================================
   PREFIX COMMANDS
========================================================= */

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) {
    return;
  }

  const content =
    message.content
      .slice(PREFIX.length)
      .trim();

  if (!content) return;

  const parts =
    content.split(/\s+/);

  const command =
    parts.shift().toLowerCase();

  try {
    await executeCommand(
      command,
      parts,
      {
        isInteraction: false,
        author: message.author,
        mentions: message.mentions,
        reply: message.reply.bind(message)
      }
    );
  } catch (error) {
    console.error(error);

    await message.reply(
      "Something went wrong while running that command."
    ).catch(() => {});
  }
});

/* =========================================================
   SLASH COMMAND DEFINITIONS
========================================================= */

const slashCommands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View a career profile")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Player")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll for a character"),

  new SlashCommandBuilder()
    .setName("characters")
    .setDescription("View your characters"),

  new SlashCommandBuilder()
    .setName("character")
    .setDescription("View a character")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Character name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setcharacter")
    .setDescription("Equip a character")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Character name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View statistics"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View balance"),

  new SlashCommandBuilder()
    .setName("career")
    .setDescription("View career"),

  new SlashCommandBuilder()
    .setName("clubs")
    .setDescription("View clubs"),

  new SlashCommandBuilder()
    .setName("leagues")
    .setDescription("View leagues"),

  new SlashCommandBuilder()
    .setName("countries")
    .setDescription("View countries"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("View trophies"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View rankings"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim daily reward"),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Play a match"),

  new SlashCommandBuilder()
    .setName("season")
    .setDescription("View current season"),

  new SlashCommandBuilder()
    .setName("league")
    .setDescription("View a competition")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("League or competition")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer to a club")
    .addStringOption(option =>
      option
        .setName("club")
        .setDescription("Club")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("interest")
    .setDescription("View club interest"),

  new SlashCommandBuilder()
    .setName("offers")
    .setDescription("View transfer offers"),

  new SlashCommandBuilder()
    .setName("acceptoffer")
    .setDescription("Accept a transfer offer")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("Offer ID")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View commands")
].map(command => command.toJSON());

/* =========================================================
   SLASH HANDLER
========================================================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const context = {
    isInteraction: true,
    user: interaction.user,
    options: interaction.options,
    replied: interaction.replied,
    deferred: interaction.deferred,

    reply: payload =>
      interaction.reply(payload),

    followUp: payload =>
      interaction.followUp(payload)
  };

  try {
    await executeCommand(
      interaction.commandName,
      [],
      context
    );
  } catch (error) {
    console.error(error);

    if (
      interaction.replied ||
      interaction.deferred
    ) {
      await interaction.followUp({
        content: "Something went wrong.",
        ephemeral: true
      }).catch(() => {});
    } else {
      await interaction.reply({
        content: "Something went wrong.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

/* =========================================================
   READY
========================================================= */

client.once("clientReady", async ready => {
  console.log(
    `Logged in as ${ready.user.tag}`
  );

  console.log(
    `Owner: ${OWNER_ID}`
  );

  console.log(
    `Current Season: ${db.seasons.current}`
  );

  try {
    if (GUILD_ID) {
      const guild =
        await ready.guilds.fetch(GUILD_ID);

      await guild.commands.set(
        slashCommands
      );

      console.log(
        `Registered ${slashCommands.length} slash commands.`
      );
    } else {
      await ready.application.commands.set(
        slashCommands
      );

      console.log(
        `Registered ${slashCommands.length} global slash commands.`
      );
    }
  } catch (error) {
    console.error(
      "Slash registration error:",
      error
    );
  }

  console.log(
    "Blue Lock Football RPG ONLINE."
  );
});

/* =========================================================
   ERRORS
========================================================= */

process.on(
  "unhandledRejection",
  error => console.error(error)
);

process.on(
  "uncaughtException",
  error => console.error(error)
);

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN).catch(error => {
  console.error(
    "Discord login failed:",
    error
  );
});
