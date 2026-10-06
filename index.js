const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
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
  console.error("Missing DISCORD_TOKEN environment variable.");
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
  guilds: {},
  seasons: {
    current: 1,
    history: []
  },
  market: {},
  events: {}
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    console.log("Database corrupted. Creating a new database.");
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* =========================================================
   DATA
========================================================= */

const RARITIES = {
  Common: {
    chance: 50,
    multiplier: 1
  },
  Uncommon: {
    chance: 25,
    multiplier: 1.05
  },
  Rare: {
    chance: 13,
    multiplier: 1.1
  },
  Epic: {
    chance: 7,
    multiplier: 1.2
  },
  Legendary: {
    chance: 3.5,
    multiplier: 1.35
  },
  Mythic: {
    chance: 1.2,
    multiplier: 1.55
  },
  Secret: {
    chance: 0.3,
    multiplier: 1.8
  }
};

const POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "DM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "ST"
];

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

const LEAGUES = {
  PremierLeague: {
    name: "Premier League",
    country: "England"
  },
  LaLiga: {
    name: "La Liga",
    country: "Spain"
  },
  Bundesliga: {
    name: "Bundesliga",
    country: "Germany"
  },
  SerieA: {
    name: "Serie A",
    country: "Italy"
  },
  Ligue1: {
    name: "Ligue 1",
    country: "France"
  },
  Eredivisie: {
    name: "Eredivisie",
    country: "Netherlands"
  },
  LigaPortugal: {
    name: "Liga Portugal",
    country: "Portugal"
  },
  BlueLockLeague: {
    name: "Neo Egoist League",
    country: "Japan"
  }
};

const CLUBS = {
  "Manchester City": {
    league: "PremierLeague",
    country: "England",
    strength: 92
  },
  "Liverpool": {
    league: "PremierLeague",
    country: "England",
    strength: 91
  },
  "Manchester United": {
    league: "PremierLeague",
    country: "England",
    strength: 88
  },
  "Arsenal": {
    league: "PremierLeague",
    country: "England",
    strength: 90
  },
  "Chelsea": {
    league: "PremierLeague",
    country: "England",
    strength: 86
  },

  "Real Madrid": {
    league: "LaLiga",
    country: "Spain",
    strength: 95
  },
  "Barcelona": {
    league: "LaLiga",
    country: "Spain",
    strength: 92
  },
  "Atletico Madrid": {
    league: "LaLiga",
    country: "Spain",
    strength: 88
  },

  "Bayern Munich": {
    league: "Bundesliga",
    country: "Germany",
    strength: 94
  },
  "Borussia Dortmund": {
    league: "Bundesliga",
    country: "Germany",
    strength: 88
  },
  "Bayer Leverkusen": {
    league: "Bundesliga",
    country: "Germany",
    strength: 89
  },

  "Inter Milan": {
    league: "SerieA",
    country: "Italy",
    strength: 91
  },
  "AC Milan": {
    league: "SerieA",
    country: "Italy",
    strength: 87
  },
  "Juventus": {
    league: "SerieA",
    country: "Italy",
    strength: 88
  },

  "PSG": {
    league: "Ligue1",
    country: "France",
    strength: 94
  },
  "Marseille": {
    league: "Ligue1",
    country: "France",
    strength: 84
  },

  "Ajax": {
    league: "Eredivisie",
    country: "Netherlands",
    strength: 84
  },
  "PSV": {
    league: "Eredivisie",
    country: "Netherlands",
    strength: 85
  },

  "Benfica": {
    league: "LigaPortugal",
    country: "Portugal",
    strength: 86
  },
  "Porto": {
    league: "LigaPortugal",
    country: "Portugal",
    strength: 85
  },

  "Bastard München": {
    league: "BlueLockLeague",
    country: "Germany",
    strength: 97
  },
  "Paris X Gen": {
    league: "BlueLockLeague",
    country: "France",
    strength: 96
  },
  "Manshine City": {
    league: "BlueLockLeague",
    country: "England",
    strength: 90
  },
  "FC Barcha": {
    league: "BlueLockLeague",
    country: "Spain",
    strength: 89
  },
  "Ubers": {
    league: "BlueLockLeague",
    country: "Italy",
    strength: 91
  }
};

const CHARACTERS = {
  isagi: {
    name: "Yoichi Isagi",
    rarity: "Legendary",
    position: "ST",
    country: "Japan",
    baseRating: 91,
    club: "Bastard München",
    skills: [
      "Meta Vision",
      "Direct Shot",
      "Spatial Awareness",
      "Off-Ball Movement",
      "Two-Gun Volley",
      "Predator Adaptation"
    ]
  },

  kaiser: {
    name: "Michael Kaiser",
    rarity: "Secret",
    position: "ST",
    country: "Germany",
    baseRating: 98,
    club: "Bastard München",
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
    baseRating: 96,
    club: "Paris X Gen",
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
    country: "France",
    baseRating: 99,
    club: "Bastard München",
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
    baseRating: 97,
    club: "Paris X Gen",
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
    baseRating: 94,
    club: "FC Barcha",
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
    baseRating: 89,
    club: "FC Barcha",
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
    baseRating: 90,
    club: "Ubers",
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
    baseRating: 93,
    club: "Manshine City",
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
    baseRating: 86,
    club: "Manshine City",
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
   TROPHIES
========================================================= */

const TROPHIES = {
  "UCL": {
    name: "UEFA Champions League",
    category: "Club"
  },
  "Premier League": {
    name: "Premier League",
    category: "League"
  },
  "La Liga": {
    name: "La Liga",
    category: "League"
  },
  "Bundesliga": {
    name: "Bundesliga",
    category: "League"
  },
  "Serie A": {
    name: "Serie A",
    category: "League"
  },
  "Ligue 1": {
    name: "Ligue 1",
    category: "League"
  },
  "Copa": {
    name: "Continental Cup",
    category: "Cup"
  },
  "World Cup": {
    name: "World Cup",
    category: "International"
  },
  "Ballon d'Or": {
    name: "Ballon d'Or",
    category: "Individual"
  },
  "Golden Boot": {
    name: "Golden Boot",
    category: "Individual"
  },
  "Golden Glove": {
    name: "Golden Glove",
    category: "Individual"
  },
  "MVP": {
    name: "Season MVP",
    category: "Individual"
  }
};

/* =========================================================
   HELPERS
========================================================= */

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function requiredXP(level) {
  return 100 + level * 75;
}

function getUser(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
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
        appearances: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        cleanSheets: 0,
        matches: 0
      },

      trophies: [],
      awards: [],

      contracts: {
        club: null,
        expiresSeason: 1
      },

      transferValue: 1000000,

      seasonStats: {
        goals: 0,
        assists: 0,
        appearances: 0,
        rating: 75
      },

      history: [],

      cooldowns: {}
    };
  }

  return db.users[userId];
}

function addXP(user, amount) {
  user.xp += amount;

  while (user.xp >= requiredXP(user.level)) {
    user.xp -= requiredXP(user.level);
    user.level++;
    user.rating = Math.min(99, user.rating + 1);
  }
}

function hasCooldown(user, command, seconds) {
  const last = user.cooldowns[command] || 0;
  return Date.now() - last < seconds * 1000;
}

function setCooldown(user, command) {
  user.cooldowns[command] = Date.now();
}

function cooldownLeft(user, command, seconds) {
  const last = user.cooldowns[command] || 0;
  return Math.ceil((seconds * 1000 - (Date.now() - last)) / 1000);
}

function ownerOnly(userId) {
  return userId === OWNER_ID;
}

function getCharacter(id) {
  return CHARACTERS[id?.toLowerCase()];
}

function addCharacter(user, id) {
  if (!user.characters.includes(id)) {
    user.characters.push(id);
    return true;
  }

  return false;
}

function giveTrophy(user, trophy) {
  if (!user.trophies.includes(trophy)) {
    user.trophies.push(trophy);
  }
}

function formatCoins(number) {
  return Number(number || 0).toLocaleString();
}

function embed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function weightedRarity() {
  const roll = Math.random() * 100;
  let current = 0;

  for (const [rarity, data] of Object.entries(RARITIES)) {
    current += data.chance;

    if (roll <= current) {
      return rarity;
    }
  }

  return "Common";
}

function rollCharacter() {
  const rarity = weightedRarity();

  const available = Object.entries(CHARACTERS)
    .filter(([_, char]) => char.rarity === rarity);

  if (!available.length) {
    const all = Object.entries(CHARACTERS);
    return all[random(0, all.length - 1)];
  }

  return available[random(0, available.length - 1)];
}

function findClub(name) {
  return Object.keys(CLUBS).find(
    x => x.toLowerCase() === name.toLowerCase()
  );
}

function findLeague(name) {
  return Object.keys(LEAGUES).find(
    x =>
      x.toLowerCase() === name.toLowerCase() ||
      LEAGUES[x].name.toLowerCase() === name.toLowerCase()
  );
}

/* =========================================================
   MATCH SYSTEM
========================================================= */

function simulateMatch(player, opponentStrength = 85) {
  const playerPower =
    player.rating +
    (player.activeCharacter
      ? getCharacter(player.activeCharacter)?.baseRating / 10 || 0
      : 0);

  const opponentPower = opponentStrength + random(-8, 8);

  const difference = playerPower - opponentPower;

  let result;

  if (difference > 10) {
    result = "win";
  } else if (difference < -10) {
    result = "loss";
  } else {
    const r = Math.random();

    if (r < 0.45) result = "win";
    else if (r < 0.9) result = "loss";
    else result = "draw";
  }

  let goals = 0;
  let assists = 0;

  if (result === "win") {
    goals = random(1, 3);
    assists = random(0, 2);
  } else if (result === "draw") {
    goals = random(0, 2);
    assists = random(0, 1);
  } else {
    goals = random(0, 1);
    assists = Math.random() < 0.4 ? 1 : 0;
  }

  player.stats.matches++;
  player.stats.appearances++;
  player.seasonStats.appearances++;

  player.stats.goals += goals;
  player.stats.assists += assists;

  player.seasonStats.goals += goals;
  player.seasonStats.assists += assists;

  if (result === "win") player.stats.wins++;
  if (result === "loss") player.stats.losses++;
  if (result === "draw") player.stats.draws++;

  const ratingChange =
    result === "win" ? random(1, 3) :
    result === "draw" ? 0 :
    -random(0, 2);

  player.rating = Math.max(
    50,
    Math.min(99, player.rating + ratingChange)
  );

  player.seasonStats.rating = player.rating;

  addXP(player, random(20, 60));

  return {
    result,
    goals,
    assists,
    ratingChange
  };
}

/* =========================================================
   SEASON SYSTEM
========================================================= */

function createLeagueTable(leagueKey) {
  const clubs = Object.keys(CLUBS)
    .filter(c => CLUBS[c].league === leagueKey);

  return clubs.map(club => ({
    club,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    points: 0
  }));
}

function simulateLeague(leagueKey) {
  const table = createLeagueTable(leagueKey);

  for (let i = 0; i < table.length; i++) {
    for (let j = i + 1; j < table.length; j++) {
      const a = table[i];
      const b = table[j];

      const powerA = CLUBS[a.club].strength + random(-5, 5);
      const powerB = CLUBS[b.club].strength + random(-5, 5);

      const goalsA = random(0, 4);
      const goalsB = random(0, 4);

      a.played++;
      b.played++;

      a.gf += goalsA;
      a.ga += goalsB;

      b.gf += goalsB;
      b.ga += goalsA;

      if (goalsA > goalsB) {
        a.wins++;
        b.losses++;
        a.points += 3;
      } else if (goalsB > goalsA) {
        b.wins++;
        a.losses++;
        b.points += 3;
      } else {
        a.draws++;
        b.draws++;
        a.points++;
        b.points++;
      }
    }
  }

  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    return (b.gf - b.ga) - (a.gf - a.ga);
  });

  return table;
}

function startNewSeason() {
  const previous = db.seasons.current;

  db.seasons.history.push({
    season: previous,
    completedAt: Date.now()
  });

  db.seasons.current++;

  for (const user of Object.values(db.users)) {
    user.seasonStats = {
      goals: 0,
      assists: 0,
      appearances: 0,
      rating: user.rating
    };
  }

  saveDB();

  return db.seasons.current;
}

/* =========================================================
   SLASH COMMANDS
========================================================= */

const slashCommands = [

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your football career profile")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Player")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll for a Blue Lock character"),

  new SlashCommandBuilder()
    .setName("characters")
    .setDescription("View your character collection"),

  new SlashCommandBuilder()
    .setName("character")
    .setDescription("View a character")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Character ID")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setcharacter")
    .setDescription("Equip one of your characters")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Character ID")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your football statistics"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View coins and gems"),

  new SlashCommandBuilder()
    .setName("career")
    .setDescription("View your career"),

  new SlashCommandBuilder()
    .setName("clubs")
    .setDescription("View available clubs"),

  new SlashCommandBuilder()
    .setName("leagues")
    .setDescription("View available leagues"),

  new SlashCommandBuilder()
    .setName("countries")
    .setDescription("View available countries"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("View your trophies"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the player leaderboard"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Play a simulated football match"),

  new SlashCommandBuilder()
    .setName("season")
    .setDescription("View the current season"),

  new SlashCommandBuilder()
    .setName("league")
    .setDescription("Simulate/view a league")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("League")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer to a club")
    .addStringOption(o =>
      o.setName("club")
        .setDescription("Club name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Trade with another player")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Player")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("event")
    .setDescription("View current events"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all commands"),

  new SlashCommandBuilder()
    .setName("owner")
    .setDescription("Owner control panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName("action")
        .setDescription("Owner action")
        .setRequired(true)
        .addChoices(
          { name: "Give Coins", value: "givecoins" },
          { name: "Give Gems", value: "givegems" },
          { name: "Give Character", value: "givechar" },
          { name: "Remove Character", value: "removechar" },
          { name: "Set Level", value: "setlevel" },
          { name: "Set XP", value: "setxp" },
          { name: "Set Rating", value: "setrating" },
          { name: "Set Club", value: "setclub" },
          { name: "Set Country", value: "setcountry" },
          { name: "Set Career", value: "setcareer" },
          { name: "Give Trophy", value: "givetrophy" },
          { name: "Reset Player", value: "resetplayer" },
          { name: "Start New Season", value: "newseason" },
          { name: "Give All Characters", value: "giveall" }
        )
    )
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Target player")
        .setRequired(false)
    )
    .addStringOption(o =>
      o.setName("value")
        .setDescription("Value")
        .setRequired(false)
    )
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Amount")
        .setRequired(false)
    )
].map(x => x.toJSON());

/* =========================================================
   COMMAND HANDLER
========================================================= */

async function executeCommand(name, args, interactionOrMessage) {
  const isInteraction = interactionOrMessage.isChatInputCommand?.();

  const user = isInteraction
    ? interactionOrMessage.user
    : interactionOrMessage.author;

  const userId = user.id;
  const player = getUser(userId);

  const reply = async (content) => {
    if (isInteraction) {
      if (interactionOrMessage.replied || interactionOrMessage.deferred) {
        return interactionOrMessage.followUp(content);
      }

      return interactionOrMessage.reply(content);
    }

    return interactionOrMessage.reply(content);
  };

  /* =====================================================
     PROFILE
  ===================================================== */

  if (name === "profile") {
    const target = isInteraction
      ? interactionOrMessage.options.getUser("user") || user
      : user;

    const p = getUser(target.id);

    const char = p.activeCharacter
      ? getCharacter(p.activeCharacter)
      : null;

    return reply({
      embeds: [
        embed(
          `${target.username}'s Career`,
          [
            `**Level:** ${p.level}`,
            `**Rating:** ${p.rating}`,
            `**Position:** ${p.position}`,
            `**Career:** ${p.career}`,
            `**Country:** ${p.country}`,
            `**Club:** ${p.club || "Free Agent"}`,
            `**Season:** ${db.seasons.current}`,
            "",
            `**Active Character:** ${char ? char.name : "None"}`,
            `**Transfer Value:** ¥${formatCoins(p.transferValue)}`,
            "",
            `**Goals:** ${p.stats.goals}`,
            `**Assists:** ${p.stats.assists}`,
            `**Appearances:** ${p.stats.appearances}`,
            `**Wins:** ${p.stats.wins}`,
            `**Trophies:** ${p.trophies.length}`
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     ROLL
  ===================================================== */

  if (name === "roll") {
    if (hasCooldown(player, "roll", 15)) {
      return reply(
        `You can roll again in **${cooldownLeft(player, "roll", 15)}s**.`
      );
    }

    setCooldown(player, "roll");

    const [id, char] = rollCharacter();

    const duplicate = player.characters.includes(id);

    if (!duplicate) {
      addCharacter(player, id);
    } else {
      player.coins += 1000;
    }

    saveDB();

    return reply({
      embeds: [
        embed(
          "Character Roll",
          [
            `**${char.name}**`,
            "",
            `Rarity: **${char.rarity}**`,
            `Position: **${char.position}**`,
            `Country: **${char.country}**`,
            `Rating: **${char.baseRating}**`,
            "",
            duplicate
              ? "Duplicate character — converted into **1,000 coins**."
              : "New character added to your collection."
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     CHARACTERS
  ===================================================== */

  if (name === "characters") {
    if (!player.characters.length) {
      return reply("You don't own any characters yet. Use `,roll`.");
    }

    const list = player.characters
      .map(id => {
        const c = getCharacter(id);

        return c
          ? `**${c.name}** — ${c.rarity} — ${c.baseRating} OVR`
          : id;
      })
      .join("\n");

    return reply({
      embeds: [
        embed(
          `${user.username}'s Characters`,
          list
        )
      ]
    });
  }

  if (name === "character") {
    const id = isInteraction
      ? interactionOrMessage.options.getString("name")
      : args[0];

    const c = getCharacter(id);

    if (!c) return reply("Character not found.");

    return reply({
      embeds: [
        embed(
          c.name,
          [
            `**Rarity:** ${c.rarity}`,
            `**Rating:** ${c.baseRating}`,
            `**Position:** ${c.position}`,
            `**Country:** ${c.country}`,
            `**Club:** ${c.club}`,
            "",
            "**Abilities**",
            ...c.skills.map((x, i) => `${i + 1}. ${x}`)
          ].join("\n")
        )
      ]
    });
  }

  if (name === "setcharacter") {
    const id = isInteraction
      ? interactionOrMessage.options.getString("name").toLowerCase()
      : args[0]?.toLowerCase();

    if (!getCharacter(id)) {
      return reply("That character doesn't exist.");
    }

    if (!player.characters.includes(id)) {
      return reply("You don't own that character.");
    }

    player.activeCharacter = id;
    player.rating = Math.max(
      player.rating,
      getCharacter(id).baseRating
    );

    saveDB();

    return reply(
      `You equipped **${getCharacter(id).name}**.`
    );
  }

  /* =====================================================
     STATS
  ===================================================== */

  if (name === "stats") {
    return reply({
      embeds: [
        embed(
          "Player Statistics",
          [
            `**Appearances:** ${player.stats.appearances}`,
            `**Goals:** ${player.stats.goals}`,
            `**Assists:** ${player.stats.assists}`,
            `**Wins:** ${player.stats.wins}`,
            `**Draws:** ${player.stats.draws}`,
            `**Losses:** ${player.stats.losses}`,
            `**Clean Sheets:** ${player.stats.cleanSheets}`,
            "",
            `**Season ${db.seasons.current}**`,
            `Goals: ${player.seasonStats.goals}`,
            `Assists: ${player.seasonStats.assists}`,
            `Appearances: ${player.seasonStats.appearances}`,
            `Rating: ${player.seasonStats.rating}`
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     BALANCE
  ===================================================== */

  if (name === "balance") {
    return reply(
      `**Coins:** ${formatCoins(player.coins)}\n**Gems:** ${formatCoins(player.gems)}`
    );
  }

  /* =====================================================
     CAREER
  ===================================================== */

  if (name === "career") {
    return reply({
      embeds: [
        embed(
          "Career",
          [
            `**Career:** ${player.career}`,
            `**Level:** ${player.level}`,
            `**Rating:** ${player.rating}`,
            `**Club:** ${player.club || "Free Agent"}`,
            `**Country:** ${player.country}`,
            `**Contract:** Season ${player.contracts.expiresSeason}`,
            `**Transfer Value:** ¥${formatCoins(player.transferValue)}`
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     CLUBS
  ===================================================== */

  if (name === "clubs") {
    const list = Object.entries(CLUBS)
      .map(
        ([club, data]) =>
          `**${club}** — ${LEAGUES[data.league]?.name || data.league} — ${data.country} — ${data.strength} OVR`
      )
      .join("\n");

    return reply({
      embeds: [
        embed("Football Clubs", list)
      ]
    });
  }

  /* =====================================================
     LEAGUES
  ===================================================== */

  if (name === "leagues") {
    const list = Object.values(LEAGUES)
      .map(
        league => `**${league.name}** — ${league.country}`
      )
      .join("\n");

    return reply({
      embeds: [
        embed("Leagues", list)
      ]
    });
  }

  /* =====================================================
     COUNTRIES
  ===================================================== */

  if (name === "countries") {
    return reply(
      `**Available Countries**\n${COUNTRIES.map(x => `• ${x}`).join("\n")}`
    );
  }

  /* =====================================================
     TROPHIES
  ===================================================== */

  if (name === "trophies") {
    if (!player.trophies.length) {
      return reply("You haven't won any trophies yet.");
    }

    const list = player.trophies
      .map(x => {
        const t = TROPHIES[x];

        return t
          ? `🏆 **${t.name}** — ${t.category}`
          : `🏆 ${x}`;
      })
      .join("\n");

    return reply({
      embeds: [
        embed("Trophy Cabinet", list)
      ]
    });
  }

  /* =====================================================
     LEADERBOARD
  ===================================================== */

  if (name === "leaderboard") {
    const users = Object.values(db.users)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    const lines = [];

    for (let i = 0; i < users.length; i++) {
      const member = await interactionOrMessage.client.users
        .fetch(users[i].id)
        .catch(() => null);

      lines.push(
        `**${i + 1}.** ${member?.username || users[i].id} — ${users[i].rating} OVR`
      );
    }

    return reply({
      embeds: [
        embed("Top Players", lines.join("\n") || "No players yet.")
      ]
    });
  }

  /* =====================================================
     DAILY
  ===================================================== */

  if (name === "daily") {
    if (hasCooldown(player, "daily", 86400)) {
      return reply(
        `Your daily reward is available in **${cooldownLeft(
          player,
          "daily",
          86400
        )}s**.`
      );
    }

    setCooldown(player, "daily");

    const coins = random(1000, 3000);
    const gems = random(5, 20);

    player.coins += coins;
    player.gems += gems;

    saveDB();

    return reply(
      `Daily reward claimed!\n\n**+${formatCoins(coins)} coins**\n**+${gems} gems**`
    );
  }

  /* =====================================================
     MATCH
  ===================================================== */

  if (name === "match") {
    if (hasCooldown(player, "match", 10)) {
      return reply(
        `You can play again in **${cooldownLeft(player, "match", 10)}s**.`
      );
    }

    setCooldown(player, "match");

    const result = simulateMatch(player, random(75, 95));

    const resultText =
      result.result === "win"
        ? "VICTORY"
        : result.result === "loss"
          ? "DEFEAT"
          : "DRAW";

    saveDB();

    return reply({
      embeds: [
        embed(
          resultText,
          [
            `**Goals:** ${result.goals}`,
            `**Assists:** ${result.assists}`,
            `**Rating Change:** ${result.ratingChange >= 0 ? "+" : ""}${result.ratingChange}`,
            `**New Rating:** ${player.rating}`,
            `**XP:** ${player.xp}/${requiredXP(player.level)}`
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     SEASON
  ===================================================== */

  if (name === "season") {
    return reply({
      embeds: [
        embed(
          `Season ${db.seasons.current}`,
          [
            `**Status:** Active`,
            `**Completed Seasons:** ${db.seasons.history.length}`,
            "",
            "Competitions:",
            "• Domestic Leagues",
            "• UEFA Champions League",
            "• Continental Cup",
            "• World Cup",
            "• Ballon d'Or",
            "• Golden Boot",
            "• Golden Glove",
            "• Season MVP"
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     LEAGUE
  ===================================================== */

  if (name === "league") {
    const leagueName = isInteraction
      ? interactionOrMessage.options.getString("name")
      : args.join(" ");

    const leagueKey = findLeague(leagueName);

    if (!leagueKey) {
      return reply("League not found.");
    }

    const table = simulateLeague(leagueKey);

    const lines = table.map(
      (x, i) =>
        `**${i + 1}. ${x.club}** — ${x.points} pts | ${x.wins}W ${x.draws}D ${x.losses}L`
    );

    return reply({
      embeds: [
        embed(
          `${LEAGUES[leagueKey].name} — Season ${db.seasons.current}`,
          lines.join("\n")
        )
      ]
    });
  }

  /* =====================================================
     TRANSFER
  ===================================================== */

  if (name === "transfer") {
    const clubName = isInteraction
      ? interactionOrMessage.options.getString("club")
      : args.join(" ");

    const club = findClub(clubName);

    if (!club) {
      return reply("Club not found.");
    }

    if (club === player.club) {
      return reply("You are already at that club.");
    }

    const clubData = CLUBS[club];

    if (player.rating + 5 < clubData.strength) {
      return reply(
        `Your rating is too low for **${club}**.\nRequired approximately: **${clubData.strength - 5} OVR**`
      );
    }

    player.club = club;
    player.contracts.club = club;
    player.contracts.expiresSeason = db.seasons.current + random(1, 3);

    player.transferValue += random(500000, 5000000);

    player.history.push({
      type: "transfer",
      club,
      season: db.seasons.current,
      timestamp: Date.now()
    });

    saveDB();

    return reply(
      `Transfer completed.\nYou joined **${club}**.`
    );
  }

  /* =====================================================
     TRADE
  ===================================================== */

  if (name === "trade") {
    return reply(
      "Trading framework is enabled. A future version can add button-based trade confirmation so both players must approve."
    );
  }

  /* =====================================================
     EVENTS
  ===================================================== */

  if (name === "event") {
    return reply({
      embeds: [
        embed(
          "Current Events",
          [
            "• Season Championship",
            "• Character Rush",
            "• UCL Challenge",
            "• Golden Boot Race",
            "• Ballon d'Or Race",
            "• Weekend Match Bonus"
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     HELP
  ===================================================== */

  if (name === "help") {
    return reply({
      embeds: [
        embed(
          "Blue Lock Football RPG",
          [
            "**Player**",
            "`,profile`",
            "`,stats`",
            "`,balance`",
            "`,career`",
            "`,trophies`",
            "",
            "**Characters**",
            "`,roll`",
            "`,characters`",
            "`,character <id>`",
            "`,setcharacter <id>`",
            "",
            "**Football**",
            "`,match`",
            "`,transfer <club>`",
            "`,clubs`",
            "`,leagues`",
            "`,countries`",
            "`,league <league>`",
            "`,season`",
            "",
            "**Rewards**",
            "`,daily`",
            "`,event`",
            "`,leaderboard`",
            "",
            "**Owner**",
            "`,rob`",
            "`,ownerhelp`"
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     OWNER ROB
  ===================================================== */

  if (name === "rob") {
    if (!ownerOnly(userId)) {
      return reply("You are not authorized to use this command.");
    }

    player.coins += 1000000000;
    player.gems += 100000;

    player.rating = 99;
    player.level = Math.max(player.level, 100);

    saveDB();

    return reply(
      "Owner reward activated.\n\n**+1,000,000,000 coins**\n**+100,000 gems**\n**99 OVR**\n**Level 100 minimum**"
    );
  }

  /* =====================================================
     OWNER HELP
  ===================================================== */

  if (name === "ownerhelp") {
    if (!ownerOnly(userId)) {
      return reply("You are not authorized to use this command.");
    }

    return reply({
      embeds: [
        embed(
          "Owner Commands",
          [
            "`,rob`",
            "`,givecoins @user amount`",
            "`,givegems @user amount`",
            "`,givechar @user character`",
            "`,removechar @user character`",
            "`,setlevel @user level`",
            "`,setxp @user xp`",
            "`,setrating @user rating`",
            "`,setclub @user club`",
            "`,setcountry @user country`",
            "`,setcareer @user career`",
            "`,givetrophy @user trophy`",
            "`,resetplayer @user`",
            "`,giveall @user`",
            "`,newseason`"
          ].join("\n")
        )
      ]
    });
  }

  /* =====================================================
     OWNER COMMANDS
  ===================================================== */

  if (
    [
      "givecoins",
      "givegems",
      "givechar",
      "removechar",
      "setlevel",
      "setxp",
      "setrating",
      "setclub",
      "setcountry",
      "setcareer",
      "givetrophy",
      "resetplayer",
      "giveall",
      "newseason"
    ].includes(name)
  ) {
    if (!ownerOnly(userId)) {
      return reply("You are not authorized to use owner commands.");
    }

    if (name === "newseason") {
      const season = startNewSeason();

      return reply(
        `New season started.\n\n**Season ${season}**`
      );
    }

    const target = isInteraction
      ? interactionOrMessage.options.getUser("user")
      : interactionOrMessage.mentions.users.first();

    if (!target) {
      return reply("You must specify a player.");
    }

    const targetPlayer = getUser(target.id);

    const value = isInteraction
      ? interactionOrMessage.options.getString("value")
      : args.slice(1).join(" ");

    const amount = isInteraction
      ? interactionOrMessage.options.getInteger("amount")
      : Number(args[1]);

    if (name === "givecoins") {
      if (!amount || amount < 1) {
        return reply("Enter a valid amount.");
      }

      targetPlayer.coins += amount;

      saveDB();

      return reply(
        `Gave **${formatCoins(amount)} coins** to ${target}.`
      );
    }

    if (name === "givegems") {
      if (!amount || amount < 1) {
        return reply("Enter a valid amount.");
      }

      targetPlayer.gems += amount;

      saveDB();

      return reply(
        `Gave **${formatCoins(amount)} gems** to ${target}.`
      );
    }

    if (name === "givechar") {
      const id = value?.toLowerCase();

      if (!getCharacter(id)) {
        return reply("Character not found.");
      }

      addCharacter(targetPlayer, id);

      saveDB();

      return reply(
        `Gave **${getCharacter(id).name}** to ${target}.`
      );
    }

    if (name === "removechar") {
      const id = value?.toLowerCase();

      if (!getCharacter(id)) {
        return reply("Character not found.");
      }

      targetPlayer.characters =
        targetPlayer.characters.filter(x => x !== id);

      if (targetPlayer.activeCharacter === id) {
        targetPlayer.activeCharacter = null;
      }

      saveDB();

      return reply(
        `Removed **${getCharacter(id).name}** from ${target}.`
      );
    }

    if (name === "setlevel") {
      const level = Number(value || amount);

      if (!level || level < 1 || level > 1000) {
        return reply("Level must be between 1 and 1000.");
      }

      targetPlayer.level = level;

      saveDB();

      return reply(
        `Set ${target}'s level to **${level}**.`
      );
    }

    if (name === "setxp") {
      const xp = Number(value || amount);

      if (isNaN(xp) || xp < 0) {
        return reply("Invalid XP.");
      }

      targetPlayer.xp = xp;

      saveDB();

      return reply(
        `Set ${target}'s XP to **${xp}**.`
      );
    }

    if (name === "setrating") {
      const rating = Number(value || amount);

      if (!rating || rating < 1 || rating > 99) {
        return reply("Rating must be between 1 and 99.");
      }

      targetPlayer.rating = rating;

      saveDB();

      return reply(
        `Set ${target}'s rating to **${rating} OVR**.`
      );
    }

    if (name === "setclub") {
      const club = findClub(value || "");

      if (!club) {
        return reply("Club not found.");
      }

      targetPlayer.club = club;
      targetPlayer.contracts.club = club;
      targetPlayer.contracts.expiresSeason =
        db.seasons.current + 2;

      saveDB();

      return reply(
        `Set ${target}'s club to **${club}**.`
      );
    }

    if (name === "setcountry") {
      const country = COUNTRIES.find(
        x => x.toLowerCase() === String(value).toLowerCase()
      );

      if (!country) {
        return reply("Country not found.");
      }

      targetPlayer.country = country;

      saveDB();

      return reply(
        `Set ${target}'s country to **${country}**.`
      );
    }

    if (name === "setcareer") {
      if (!value) {
        return reply("Enter a career.");
      }

      targetPlayer.career = value;

      saveDB();

      return reply(
        `Set ${target}'s career to **${value}**.`
      );
    }

    if (name === "givetrophy") {
      const trophy = Object.keys(TROPHIES).find(
        x =>
          x.toLowerCase() ===
          String(value).toLowerCase()
      );

      if (!trophy) {
        return reply(
          `Trophy not found.\nAvailable: ${Object.keys(TROPHIES).join(", ")}`
        );
      }

      giveTrophy(targetPlayer, trophy);

      saveDB();

      return reply(
        `Gave **${TROPHIES[trophy].name}** to ${target}.`
      );
    }

    if (name === "giveall") {
      for (const id of Object.keys(CHARACTERS)) {
        addCharacter(targetPlayer, id);
      }

      targetPlayer.coins += 1000000;
      targetPlayer.gems += 10000;
      targetPlayer.rating = 99;

      saveDB();

      return reply(
        `Gave ${target} **every character**, 1,000,000 coins, 10,000 gems and 99 OVR.`
      );
    }

    if (name === "resetplayer") {
      delete db.users[target.id];

      saveDB();

      return reply(
        `Reset ${target}'s entire RPG profile.`
      );
    }
  }
}

/* =========================================================
   PREFIX COMMAND PARSER
========================================================= */

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const content = message.content.slice(PREFIX.length).trim();

  if (!content) return;

  const parts = content.split(/\s+/);

  const command = parts.shift().toLowerCase();

  try {
    await executeCommand(
      command,
      parts,
      message
    );
  } catch (error) {
    console.error(error);

    if (!message.replied) {
      await message.reply(
        "Something went wrong while executing that command."
      ).catch(() => {});
    }
  }
});

/* =========================================================
   SLASH COMMAND HANDLER
========================================================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const name = interaction.commandName;

    if (name === "owner") {
      const action = interaction.options.getString("action");

      await executeCommand(
        action,
        [],
        {
          ...interaction,
          isChatInputCommand: () => true
        }
      );

      return;
    }

    await executeCommand(
      name,
      [],
      interaction
    );
  } catch (error) {
    console.error(error);

    const response = {
      content: "Something went wrong.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => {});
    } else {
      await interaction.reply(response).catch(() => {});
    }
  }
});

/* =========================================================
   READY + SLASH REGISTRATION
========================================================= */

client.once("clientReady", async readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log(`Owner ID: ${OWNER_ID}`);
  console.log(`Prefix: ${PREFIX}`);
  console.log(`Season: ${db.seasons.current}`);

  try {
    if (GUILD_ID) {
      const guild = await readyClient.guilds.fetch(GUILD_ID);

      await guild.commands.set(slashCommands);

      console.log(
        `Registered ${slashCommands.length} slash commands in ${guild.name}.`
      );
    } else {
      await readyClient.application.commands.set(slashCommands);

      console.log(
        `Registered ${slashCommands.length} global slash commands.`
      );
    }
  } catch (error) {
    console.error("Slash command registration failed:", error);
  }

  console.log("Blue Lock Football RPG is ONLINE.");
});

/* =========================================================
   ERROR HANDLING
========================================================= */

process.on("unhandledRejection", error => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
});

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN).catch(error => {
  console.error("Discord login failed:", error);
});
