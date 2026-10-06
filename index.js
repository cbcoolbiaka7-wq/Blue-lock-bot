const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ===============================
// CONFIG
// ===============================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

const PREFIX = ",";
const OWNER_ID = "1547542814525493269";

if (!TOKEN) {
  throw new Error("Missing DISCORD_TOKEN");
}

// ===============================
// CLIENT
// ===============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ===============================
// DATABASE
// ===============================

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({ players: {} }, null, 2)
  );
}

let db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

function saveDB() {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(db, null, 2)
  );
}

// ===============================
// HELPERS
// ===============================

function isOwner(id) {
  return id === OWNER_ID;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function xpNeeded(level) {
  return 100 + level * 50;
}

// ===============================
// CLUBS / NEL
// ===============================

const CLUBS = [
  "Bastard München",
  "Paris X Gen",
  "Ubers",
  "Manshine City",
  "FC Barcha",
  "Japan U-20",
  "Blue Lock Eleven",
  "Real Madrid",
  "Ajax",
  "FC Barcelona"
];

const CLUB_ALIASES = {
  bm: "Bastard München",
  bastardmunchen: "Bastard München",
  munchen: "Bastard München",

  pxg: "Paris X Gen",
  parisxgen: "Paris X Gen",

  ubers: "Ubers",

  manshine: "Manshine City",
  manshinecity: "Manshine City",

  barcha: "FC Barcha",
  fcbarcha: "FC Barcha",

  japan: "Japan U-20",
  japanu20: "Japan U-20",

  bluelock: "Blue Lock Eleven",

  madrid: "Real Madrid",
  realmadrid: "Real Madrid",

  barca: "FC Barcelona",
  barcelona: "FC Barcelona"
};

// ===============================
// BLUE LOCK MANGA CHARACTERS
// ===============================

const PLAYER_DATA = [
  {
    name: "Yoichi Isagi",
    country: "Japan",
    club: "Bastard München",
    rating: 94,
    position: "ST",
    skills: [
      "Meta Vision",
      "Direct Shot",
      "Two-Gun Volley",
      "Spatial Awareness",
      "Off-Ball Movement"
    ],
    flow: "Meta Vision"
  },

  {
    name: "Michael Kaiser",
    country: "Germany",
    club: "Bastard München",
    rating: 98,
    position: "ST",
    skills: [
      "Kaiser Impact",
      "Kaiser Impact Magnus",
      "Predator Eye",
      "Kaiser Vision",
      "Perfect Finish"
    ],
    flow: "Emperor"
  },

  {
    name: "Noel Noa",
    country: "France",
    club: "Bastard München",
    rating: 100,
    position: "ST",
    skills: [
      "Ambidextrous Kick",
      "Perfect Shot",
      "Master Touch",
      "World-Class Vision",
      "Perfect Finish"
    ],
    flow: "Master"
  },

  {
    name: "Rin Itoshi",
    country: "Japan",
    club: "Paris X Gen",
    rating: 97,
    position: "ST",
    skills: [
      "Puppet Control",
      "Destroyer Shot",
      "Spatial Reading",
      "Precision Kick",
      "Flow Control"
    ],
    flow: "Destroyer"
  },

  {
    name: "Julian Loki",
    country: "France",
    club: "Paris X Gen",
    rating: 99,
    position: "ST",
    skills: [
      "Godspeed",
      "Lightning Run",
      "Explosive Acceleration",
      "Speed Break",
      "Perfect Timing"
    ],
    flow: "Godspeed"
  },

  {
    name: "Ryusei Shidou",
    country: "Japan",
    club: "Paris X Gen",
    rating: 96,
    position: "ST",
    skills: [
      "Dragon Drive",
      "Acrobatic Finish",
      "Spatial Instinct",
      "Explosive Volley",
      "Goal Hunter"
    ],
    flow: "Destroyer"
  },

  {
    name: "Charles Chevalier",
    country: "France",
    club: "Paris X Gen",
    rating: 94,
    position: "AM",
    skills: [
      "Killer Pass",
      "Threaded Pass",
      "Field Vision",
      "Counter Pass",
      "Creative Assist"
    ],
    flow: "Playmaker"
  },

  {
    name: "Tabito Karasu",
    country: "Japan",
    club: "Paris X Gen",
    rating: 90,
    position: "CM",
    skills: [
      "Ball Keeping",
      "Pressure Control",
      "Midfield Lock",
      "Feint",
      "Tactical Pass"
    ],
    flow: "Playmaker"
  },

  {
    name: "Meguru Bachira",
    country: "Japan",
    club: "FC Barcha",
    rating: 91,
    position: "RW",
    skills: [
      "Monster Dribble",
      "Elastic Dribble",
      "Nutmeg",
      "Creative Pass",
      "1v1 Break"
    ],
    flow: "Monster"
  },

  {
    name: "Lavinho",
    country: "Brazil",
    club: "FC Barcha",
    rating: 97,
    position: "ST",
    skills: [
      "Street Dribble",
      "Elastic Touch",
      "Rainbow Flick",
      "Dance Step",
      "Brazilian Flow"
    ],
    flow: "Street"
  },

  {
    name: "Shoei Barou",
    country: "Japan",
    club: "Ubers",
    rating: 95,
    position: "ST",
    skills: [
      "Predator Eye",
      "Chop Feint",
      "Devil Shot",
      "King's Run",
      "Power Finish"
    ],
    flow: "King"
  },

  {
    name: "Don Lorenzo",
    country: "Japan",
    club: "Ubers",
    rating: 94,
    position: "CB",
    skills: [
      "Ace Eater",
      "Zombie Dribble",
      "Defensive Lock",
      "Ball Steal",
      "Counter Attack"
    ],
    flow: "Lockdown"
  },

  {
    name: "Marc Snuffy",
    country: "Italy",
    club: "Ubers",
    rating: 97,
    position: "ST",
    skills: [
      "Tactical Mastery",
      "Predator Eye",
      "Perfect Assist",
      "Strategic Finish",
      "Team Control"
    ],
    flow: "Master"
  },

  {
    name: "Oliver Aiku",
    country: "Japan",
    club: "Ubers",
    rating: 89,
    position: "CB",
    skills: [
      "Defensive Reading",
      "Aerial Control",
      "Man Marking",
      "Interception",
      "Counter Pass"
    ],
    flow: "Lockdown"
  },

  {
    name: "Ikki Niko",
    country: "Japan",
    club: "Ubers",
    rating: 87,
    position: "CB",
    skills: [
      "Spatial Awareness",
      "Interception",
      "Field Reading",
      "Build Up",
      "Prediction"
    ],
    flow: "Vision"
  },

  {
    name: "Seishiro Nagi",
    country: "Japan",
    club: "Manshine City",
    rating: 94,
    position: "ST",
    skills: [
      "Perfect Trap",
      "Five-Stage Revolver",
      "Fake Volley",
      "Trap Control",
      "Impossible Finish"
    ],
    flow: "Trapper"
  },

  {
    name: "Reo Mikage",
    country: "Japan",
    club: "Manshine City",
    rating: 90,
    position: "CM",
    skills: [
      "Chameleon",
      "Copy Skill",
      "Creative Pass",
      "Adaptive Play",
      "Vision"
    ],
    flow: "Chameleon"
  },

  {
    name: "Chris Prince",
    country: "England",
    club: "Manshine City",
    rating: 98,
    position: "ST",
    skills: [
      "Perfect Body",
      "Power Shot",
      "Acceleration",
      "Physical Mastery",
      "Super Strike"
    ],
    flow: "Master"
  },

  {
    name: "Hyoma Chigiri",
    country: "Japan",
    club: "Manshine City",
    rating: 91,
    position: "LW",
    skills: [
      "44 Panther",
      "Speed Burst",
      "Red Panther",
      "Breakaway",
      "Acceleration"
    ],
    flow: "Godspeed"
  },

  {
    name: "Agi",
    country: "England",
    club: "Manshine City",
    rating: 88,
    position: "ST",
    skills: [
      "Physical Control",
      "Power Run",
      "Target Play",
      "Aerial Duel",
      "Hold Up"
    ],
    flow: "Power"
  },

  {
    name: "Rensuke Kunigami",
    country: "Japan",
    club: "Bastard München",
    rating: 89,
    position: "ST",
    skills: [
      "Lefty Shot",
      "Power Shot",
      "Midrange Strike",
      "Physical Burst",
      "Direct Run"
    ],
    flow: "Hero"
  },

  {
    name: "Yo Hiori",
    country: "Japan",
    club: "Bastard München",
    rating: 89,
    position: "AM",
    skills: [
      "Laser Pass",
      "Threaded Pass",
      "Field Vision",
      "Through Ball",
      "Precision Cross"
    ],
    flow: "Vision"
  },

  {
    name: "Kenyu Yukimiya",
    country: "Japan",
    club: "Bastard München",
    rating: 88,
    position: "LW",
    skills: [
      "Gyro Shot",
      "Dribble Drive",
      "1v1 Duel",
      "Cut Inside",
      "Mirage Shot"
    ],
    flow: "Dribbler"
  },

  {
    name: "Alexis Ness",
    country: "Germany",
    club: "Bastard München",
    rating: 88,
    position: "AM",
    skills: [
      "Magic Pass",
      "Curve Pass",
      "Assist Chain",
      "Link Up",
      "Creative Feed"
    ],
    flow: "Playmaker"
  },

  {
    name: "Gin Gagamaru",
    country: "Japan",
    club: "Bastard München",
    rating: 85,
    position: "GK",
    skills: [
      "Super Save",
      "Reflex",
      "Aerial Reach",
      "Acrobatic Block",
      "Counter Launch"
    ],
    flow: "Guardian"
  },

  {
    name: "Sae Itoshi",
    country: "Japan",
    club: "Japan U-20",
    rating: 97,
    position: "AM",
    skills: [
      "Perfect Pass",
      "Control Tower",
      "Threaded Assist",
      "Field Domination",
      "Precision Kick"
    ],
    flow: "Vision"
  },

  {
    name: "Shuto Sendo",
    country: "Japan",
    club: "Ubers",
    rating: 82,
    position: "ST",
    skills: [
      "Aerial Finish",
      "Power Header",
      "Positioning",
      "Link Up",
      "Volley"
    ],
    flow: null
  },

  {
    name: "Jyubei Aryu",
    country: "Japan",
    club: "Ubers",
    rating: 85,
    position: "CB",
    skills: [
      "Long Reach",
      "Aerial Block",
      "Header",
      "Defensive Range",
      "Height Advantage"
    ],
    flow: "Guardian"
  },

  {
    name: "Eita Otoya",
    country: "Japan",
    club: "FC Barcha",
    rating: 86,
    position: "RW",
    skills: [
      "Stealth Run",
      "Off-Ball Burst",
      "Blindside",
      "Quick Pass",
      "Speed Cut"
    ],
    flow: "Shadow"
  },

  {
    name: "Aoshi Tokimitsu",
    country: "Japan",
    club: "Manshine City",
    rating: 84,
    position: "CM",
    skills: [
      "Physical Burst",
      "Relentless Press",
      "Recovery",
      "Power Run",
      "Ball Shield"
    ],
    flow: "Power"
  },

  {
    name: "Zantetsu Tsurugi",
    country: "Japan",
    club: "Manshine City",
    rating: 82,
    position: "RW",
    skills: [
      "Explosive Start",
      "Straight Run",
      "Speed Burst",
      "Acceleration",
      "Direct Run"
    ],
    flow: "Godspeed"
  },

  // NEL VERSIONS

  {
    name: "Yoichi Isagi - NEL",
    country: "Japan",
    club: "Bastard München",
    rating: 96,
    position: "ST",
    skills: [
      "Meta Vision",
      "Direct Shot",
      "Two-Gun Volley",
      "Adaptation",
      "Spatial Awareness"
    ],
    flow: "Meta Vision"
  },

  {
    name: "Michael Kaiser - NEL",
    country: "Germany",
    club: "Bastard München",
    rating: 98,
    position: "ST",
    skills: [
      "Kaiser Impact",
      "Kaiser Impact Magnus",
      "Predator Eye",
      "Kaiser Vision",
      "Perfect Finish"
    ],
    flow: "Emperor"
  },

  {
    name: "Rin Itoshi - NEL",
    country: "Japan",
    club: "Paris X Gen",
    rating: 98,
    position: "ST",
    skills: [
      "Destroyer Mode",
      "Puppet Control",
      "Precision Kick",
      "Spatial Reading",
      "Flow"
    ],
    flow: "Destroyer"
  },

  {
    name: "Shoei Barou - NEL",
    country: "Japan",
    club: "Ubers",
    rating: 96,
    position: "ST",
    skills: [
      "Predator Eye",
      "Chop Feint",
      "Devil Shot",
      "King's Run",
      "Predator Finish"
    ],
    flow: "King"
  },

  {
    name: "Seishiro Nagi - NEL",
    country: "Japan",
    club: "Manshine City",
    rating: 95,
    position: "ST",
    skills: [
      "Five-Stage Revolver",
      "Perfect Trap",
      "Fake Volley",
      "Trap Control",
      "Adaptation"
    ],
    flow: "Trapper"
  },

  {
    name: "Meguru Bachira - NEL",
    country: "Japan",
    club: "FC Barcha",
    rating: 93,
    position: "RW",
    skills: [
      "Monster Dribble",
      "Elastic Touch",
      "Nutmeg",
      "Creative Pass",
      "Solo Break"
    ],
    flow: "Monster"
  },

  {
    name: "Hyoma Chigiri - NEL",
    country: "Japan",
    club: "Manshine City",
    rating: 93,
    position: "LW",
    skills: [
      "44 Panther",
      "Speed Burst",
      "Red Panther",
      "Breakaway",
      "Acceleration"
    ],
    flow: "Godspeed"
  },

  {
    name: "Reo Mikage - NEL",
    country: "Japan",
    club: "Manshine City",
    rating: 92,
    position: "CM",
    skills: [
      "Chameleon",
      "Copy Skill",
      "Creative Pass",
      "Adaptation",
      "Field Vision"
    ],
    flow: "Chameleon"
  },

  {
    name: "Rensuke Kunigami - NEL",
    country: "Japan",
    club: "Bastard München",
    rating: 92,
    position: "ST",
    skills: [
      "Lefty Shot",
      "Power Shot",
      "Midrange Strike",
      "Physical Burst",
      "Direct Run"
    ],
    flow: "Hero"
  },

  {
    name: "Hiori Yo - NEL",
    country: "Japan",
    club: "Bastard München",
    rating: 92,
    position: "AM",
    skills: [
      "Laser Pass",
      "Threaded Pass",
      "Field Vision",
      "Through Ball",
      "Precision Cross"
    ],
    flow: "Vision"
  },

  {
    name: "Charles Chevalier - NEL",
    country: "France",
    club: "Paris X Gen",
    rating: 95,
    position: "AM",
    skills: [
      "Killer Pass",
      "Threaded Pass",
      "Counter Pass",
      "Vision",
      "Creative Assist"
    ],
    flow: "Playmaker"
  },

  {
    name: "Don Lorenzo - NEL",
    country: "Japan",
    club: "Ubers",
    rating: 95,
    position: "CB",
    skills: [
      "Ace Eater",
      "Zombie Dribble",
      "Defensive Lock",
      "Ball Steal",
      "Counter Attack"
    ],
    flow: "Lockdown"
  },

  // LOWER RATED NEL / OTHER PLAYERS

  {
    name: "Kiyoshi Fujimoto",
    country: "Japan",
    club: "Ajax",
    rating: 78,
    position: "ST",
    skills: [
      "Quick Step",
      "Sharp Pass",
      "Direct Shot",
      "Press Break",
      "Counter Run"
    ],
    flow: null
  },

  {
    name: "Yohei Tanaka",
    country: "Japan",
    club: "PSV",
    rating: 76,
    position: "CM",
    skills: [
      "Quick Pass",
      "Dribble Cut",
      "Sprint",
      "Low Shot",
      "Press"
    ],
    flow: null
  },

  {
    name: "Kenyu Aoba",
    country: "Japan",
    club: "Benfica",
    rating: 80,
    position: "RW",
    skills: [
      "Curve Shot",
      "Ball Control",
      "Quick Turn",
      "Through Pass",
      "Counter"
    ],
    flow: null
  },

  {
    name: "Shizuka Haiji",
    country: "Japan",
    club: "Porto",
    rating: 75,
    position: "LW",
    skills: [
      "Fast Dribble",
      "Cross",
      "Sprint",
      "Long Pass",
      "Finish"
    ],
    flow: null
  },

  {
    name: "Kota Sakamoto",
    country: "Japan",
    club: "Real Madrid",
    rating: 81,
    position: "CM",
    skills: [
      "Power Run",
      "Press",
      "Shot",
      "Pass",
      "Recovery"
    ],
    flow: null
  }
];

const PLAYERS = {};

for (const player of PLAYER_DATA) {
  PLAYERS[player.name] = player;
}

// ===============================
// SMART ALIASES
// ===============================

const PLAYER_ALIASES = {
  isagi: "Yoichi Isagi",
  yoichi: "Yoichi Isagi",
  yoichiisagi: "Yoichi Isagi",

  kaiser: "Michael Kaiser",
  michael: "Michael Kaiser",
  micheal: "Michael Kaiser",
  michaelkaiser: "Michael Kaiser",

  noa: "Noel Noa",
  noel: "Noel Noa",

  rin: "Rin Itoshi",
  rinitoshi: "Rin Itoshi",

  loki: "Julian Loki",
  julianloki: "Julian Loki",

  shidou: "Ryusei Shidou",
  ryusei: "Ryusei Shidou",

  bachira: "Meguru Bachira",
  barou: "Shoei Barou",
  nagi: "Seishiro Nagi",
  reo: "Reo Mikage",
  kunigami: "Rensuke Kunigami",
  chigiri: "Hyoma Chigiri",
  hiori: "Yo Hiori",
  yukimiya: "Kenyu Yukimiya",
  sae: "Sae Itoshi",
  lavinho: "Lavinho",
  snuffy: "Marc Snuffy",
  lorenzo: "Don Lorenzo"
};

// ===============================
// FLOW SYSTEM
// ===============================

const FLOWS = {
  "Meta Vision": {
    rarity: "Legendary",
    requiredRating: 88,
    abilities: [
      {
        name: "Meta Vision",
        power: 35,
        stamina: 0,
        cooldown: 2
      },
      {
        name: "Direct Counter",
        power: 40,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Spatial Reading",
        power: 38,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Two-Gun Volley",
        power: 55,
        stamina: 8,
        cooldown: 4
      },
      {
        name: "Predicted Route",
        power: 43,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Field Command",
        power: 48,
        stamina: 6,
        cooldown: 4
      }
    ]
  },

  Emperor: {
    rarity: "Mythic",
    requiredRating: 92,
    abilities: [
      {
        name: "Kaiser Impact",
        power: 55,
        stamina: 8,
        cooldown: 4
      },
      {
        name: "Kaiser Impact Magnus",
        power: 68,
        stamina: 10,
        cooldown: 5
      },
      {
        name: "Predator Eye",
        power: 48,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Emperor Vision",
        power: 43,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Emperor Run",
        power: 45,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Perfect Finish",
        power: 62,
        stamina: 9,
        cooldown: 5
      }
    ]
  },

  Destroyer: {
    rarity: "Mythic",
    requiredRating: 90,
    abilities: [
      {
        name: "Destroyer Shot",
        power: 55,
        stamina: 8,
        cooldown: 4
      },
      {
        name: "Spatial Instinct",
        power: 38,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Explosive Volley",
        power: 57,
        stamina: 8,
        cooldown: 4
      },
      {
        name: "Destroyer Dribble",
        power: 48,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Goal Hunter",
        power: 50,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Predator Finish",
        power: 60,
        stamina: 9,
        cooldown: 5
      }
    ]
  },

  Godspeed: {
    rarity: "Mythic",
    requiredRating: 90,
    abilities: [
      {
        name: "Godspeed",
        power: 55,
        stamina: 7,
        cooldown: 3
      },
      {
        name: "Lightning Run",
        power: 50,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Speed Break",
        power: 46,
        stamina: 5,
        cooldown: 2
      },
      {
        name: "Perfect Timing",
        power: 40,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Lightning Finish",
        power: 53,
        stamina: 7,
        cooldown: 4
      }
    ]
  },

  Monster: {
    rarity: "Legendary",
    requiredRating: 84,
    abilities: [
      {
        name: "Monster Dribble",
        power: 47,
        stamina: 5,
        cooldown: 2
      },
      {
        name: "Elastic Touch",
        power: 44,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Nutmeg",
        power: 52,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Monster Pass",
        power: 41,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Creative Finish",
        power: 47,
        stamina: 5,
        cooldown: 3
      }
    ]
  },

  King: {
    rarity: "Legendary",
    requiredRating: 88,
    abilities: [
      {
        name: "King's Shot",
        power: 50,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Predator Eye",
        power: 47,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Chop Feint",
        power: 43,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "King's Run",
        power: 45,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Devil's Finish",
        power: 57,
        stamina: 8,
        cooldown: 4
      }
    ]
  },

  Street: {
    rarity: "Legendary",
    requiredRating: 84,
    abilities: [
      {
        name: "Street Dribble",
        power: 46,
        stamina: 5,
        cooldown: 2
      },
      {
        name: "Rainbow Flick",
        power: 50,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Dance Step",
        power: 44,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Elastic Touch",
        power: 45,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Street Finish",
        power: 48,
        stamina: 6,
        cooldown: 3
      }
    ]
  },

  Trapper: {
    rarity: "Legendary",
    requiredRating: 88,
    abilities: [
      {
        name: "Perfect Trap",
        power: 45,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Fake Volley",
        power: 50,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Trap Control",
        power: 43,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Impossible Finish",
        power: 58,
        stamina: 8,
        cooldown: 4
      },
      {
        name: "Trap Shot",
        power: 53,
        stamina: 7,
        cooldown: 4
      }
    ]
  },

  Playmaker: {
    rarity: "Legendary",
    requiredRating: 86,
    abilities: [
      {
        name: "Killer Pass",
        power: 45,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Threaded Pass",
        power: 43,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Field Command",
        power: 46,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Through Ball",
        power: 48,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Perfect Assist",
        power: 54,
        stamina: 6,
        cooldown: 4
      }
    ]
  },

  Lockdown: {
    rarity: "Legendary",
    requiredRating: 86,
    abilities: [
      {
        name: "Ace Eater",
        power: 48,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Defensive Lock",
        power: 50,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Ball Steal",
        power: 44,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Interception",
        power: 45,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Counter Launch",
        power: 47,
        stamina: 4,
        cooldown: 3
      }
    ]
  },

  Vision: {
    rarity: "Rare",
    requiredRating: 80,
    abilities: [
      {
        name: "Field Vision",
        power: 38,
        stamina: 2,
        cooldown: 2
      },
      {
        name: "Spatial Reading",
        power: 40,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Prediction",
        power: 42,
        stamina: 3,
        cooldown: 3
      },
      {
        name: "Through Ball",
        power: 43,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Counter Position",
        power: 41,
        stamina: 3,
        cooldown: 2
      }
    ]
  },

  Hero: {
    rarity: "Rare",
    requiredRating: 82,
    abilities: [
      {
        name: "Hero Shot",
        power: 48,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Lefty Shot",
        power: 46,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Power Run",
        power: 43,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Direct Run",
        power: 40,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Physical Burst",
        power: 42,
        stamina: 5,
        cooldown: 3
      }
    ]
  },

  Chameleon: {
    rarity: "Legendary",
    requiredRating: 86,
    abilities: [
      {
        name: "Copy Skill",
        power: 45,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Chameleon",
        power: 48,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Adaptation",
        power: 44,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Creative Pass",
        power: 43,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Mirror Play",
        power: 50,
        stamina: 6,
        cooldown: 4
      }
    ]
  },

  Dribbler: {
    rarity: "Rare",
    requiredRating: 80,
    abilities: [
      {
        name: "Gyro Dribble",
        power: 43,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "1v1 Duel",
        power: 47,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Cut Inside",
        power: 44,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Mirage Shot",
        power: 48,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Dribble Drive",
        power: 45,
        stamina: 5,
        cooldown: 3
      }
    ]
  },

  Guardian: {
    rarity: "Rare",
    requiredRating: 80,
    abilities: [
      {
        name: "Super Save",
        power: 50,
        stamina: 3,
        cooldown: 3
      },
      {
        name: "Reflex",
        power: 45,
        stamina: 2,
        cooldown: 2
      },
      {
        name: "Aerial Reach",
        power: 43,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Acrobatic Block",
        power: 48,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Counter Launch",
        power: 45,
        stamina: 3,
        cooldown: 2
      }
    ]
  },

  Shadow: {
    rarity: "Rare",
    requiredRating: 78,
    abilities: [
      {
        name: "Stealth Run",
        power: 43,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Blindside",
        power: 46,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Shadow Cut",
        power: 44,
        stamina: 4,
        cooldown: 2
      },
      {
        name: "Quick Pass",
        power: 39,
        stamina: 2,
        cooldown: 2
      },
      {
        name: "Off-Ball Burst",
        power: 42,
        stamina: 3,
        cooldown: 2
      }
    ]
  },

  Power: {
    rarity: "Rare",
    requiredRating: 80,
    abilities: [
      {
        name: "Power Shot",
        power: 49,
        stamina: 6,
        cooldown: 3
      },
      {
        name: "Power Run",
        power: 43,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Physical Burst",
        power: 42,
        stamina: 5,
        cooldown: 3
      },
      {
        name: "Body Shield",
        power: 40,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Strong Finish",
        power: 51,
        stamina: 7,
        cooldown: 4
      }
    ]
  },

  Master: {
    rarity: "Mythic",
    requiredRating: 94,
    abilities: [
      {
        name: "Master Touch",
        power: 55,
        stamina: 3,
        cooldown: 2
      },
      {
        name: "Perfect Finish",
        power: 65,
        stamina: 8,
        cooldown: 5
      },
      {
        name: "Tactical Mastery",
        power: 58,
        stamina: 5,
        cooldown: 4
      },
      {
        name: "World-Class Vision",
        power: 60,
        stamina: 4,
        cooldown: 3
      },
      {
        name: "Strategic Play",
        power: 56,
        stamina: 5,
        cooldown: 4
      }
    ]
  }
};

// ===============================
// RESOLVERS
// ===============================

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

function resolvePlayer(input) {
  const key = normalize(input);

  if (PLAYER_ALIASES[key]) {
    return PLAYER_ALIASES[key];
  }

  const exact = Object.keys(PLAYERS).find(
    name => normalize(name) === key
  );

  if (exact) return exact;

  let best = null;
  let distance = Infinity;

  for (const name of Object.keys(PLAYERS)) {
    const d = levenshtein(key, normalize(name));

    if (d < distance) {
      distance = d;
      best = name;
    }
  }

  return distance <= Math.max(2, Math.floor(key.length * 0.35))
    ? best
    : null;
}

function resolveFlow(input) {
  const key = normalize(input);

  const exact = Object.keys(FLOWS).find(
    flow => normalize(flow) === key
  );

  if (exact) return exact;

  let best = null;
  let distance = Infinity;

  for (const flow of Object.keys(FLOWS)) {
    const d = levenshtein(key, normalize(flow));

    if (d < distance) {
      distance = d;
      best = flow;
    }
  }

  return distance <= Math.max(2, Math.floor(key.length * 0.4))
    ? best
    : null;
}

function resolveClub(input) {
  const key = normalize(input);

  if (CLUB_ALIASES[key]) {
    return CLUB_ALIASES[key];
  }

  const exact = CLUBS.find(
    club => normalize(club) === key
  );

  if (exact) return exact;

  return CLUBS.find(
    club => normalize(club).includes(key)
  ) || null;
}

// ===============================
// USER DATA
// ===============================

function getUser(userId) {
  if (!db.players[userId]) {
    db.players[userId] = {
      coins: 1000,
      gems: 100,
      level: 1,
      xp: 0,

      rating: 60,
      position: "ST",

      career: "Rookie",
      country: "Japan",
      club: "No Club",

      activePlayer: null,
      players: [],

      stamina: 100,

      unlockedFlows: [],
      activeFlow: null,
      flowCooldowns: {},

      clubInterest: {},
      offers: [],

      trophies: [],

      transferValue: 100000,

      stats: {
        matches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goals: 0,
        assists: 0,
        bestRating: 0
      }
    };

    saveDB();
  }

  const user = db.players[userId];

  user.players ??= [];
  user.unlockedFlows ??= [];
  user.flowCooldowns ??= {};
  user.clubInterest ??= {};
  user.offers ??= [];
  user.trophies ??= [];

  return user;
}

// ===============================
// XP
// ===============================

function addXP(user, amount) {
  user.xp += amount;

  while (user.xp >= xpNeeded(user.level)) {
    user.xp -= xpNeeded(user.level);
    user.level++;

    if (user.rating < 99) {
      user.rating++;
    }
  }
}

// ===============================
// ROLL SYSTEM
// ===============================

function rollCharacter() {
  const chance = Math.random();

  let rarity;

  if (chance < 0.01) {
    rarity = "MYTHIC";
  } else if (chance < 0.06) {
    rarity = "LEGENDARY";
  } else if (chance < 0.22) {
    rarity = "EPIC";
  } else if (chance < 0.55) {
    rarity = "RARE";
  } else {
    rarity = "COMMON";
  }

  let possible = Object.values(PLAYERS);

  if (rarity === "MYTHIC") {
    possible = possible.filter(p => p.rating >= 97);
  }

  if (rarity === "LEGENDARY") {
    possible = possible.filter(p => p.rating >= 93);
  }

  if (rarity === "EPIC") {
    possible = possible.filter(p => p.rating >= 87);
  }

  if (rarity === "RARE") {
    possible = possible.filter(p => p.rating >= 80);
  }

  if (!possible.length) {
    possible = Object.values(PLAYERS);
  }

  return {
    rarity,
    player: pick(possible)
  };
}

// ===============================
// FLOW UNLOCK
// ===============================

function unlockFlow(user, flowName, userId) {
  const flow = FLOWS[flowName];

  if (!flow) {
    return "That Flow doesn't exist.";
  }

  if (user.unlockedFlows.includes(flowName)) {
    return "You already own this Flow.";
  }

  if (!isOwner(userId) && user.rating < flow.requiredRating) {
    return `You need **${flow.requiredRating} OVR** to unlock ${flowName} Flow.`;
  }

  user.unlockedFlows.push(flowName);
  user.activeFlow = flowName;

  saveDB();

  return `🔥 You unlocked **${flowName} Flow**!`;
}

// ===============================
// MATCH SYSTEM
// ===============================

async function startMatch(userId, channel) {
  const user = getUser(userId);
  const ownerMode = isOwner(userId);

  if (!user.activePlayer && user.players.length) {
    user.activePlayer = user.players[0];
  }

  if (!user.activePlayer) {
    return channel.send(
      "You need a character first. Use `,roll`."
    );
  }

  const player = PLAYERS[user.activePlayer];

  const opponents = Object.values(PLAYERS).filter(
    p => p.name !== player.name
  );

  const opponent = pick(opponents);

  let chances = 5;
  let goals = 0;
  let assists = 0;
  let rating = 6.0;

  let ended = false;

  function matchEmbed(status = "Choose an action.") {
    return new EmbedBuilder()
      .setTitle(`⚽ Blue Lock Match`)
      .setDescription(
        `**${player.name}** vs **${opponent.name}**\n\n` +
        `Your OVR: **${user.rating}**\n` +
        `Opponent OVR: **${opponent.rating}**\n\n` +
        `Chances: **${chances}**\n` +
        `Goals: **${goals}**\n` +
        `Assists: **${assists}**\n` +
        `Rating: **${rating.toFixed(1)}**\n` +
        `Stamina: **${ownerMode ? "∞" : user.stamina + "%" }**\n\n` +
        `> ${status}`
      );
  }

  function mainButtons() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`shoot:${userId}`)
        .setLabel("SHOOT")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`pass:${userId}`)
        .setLabel("PASS")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`dribble:${userId}`)
        .setLabel("DRIBBLE")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`flow:${userId}`)
        .setLabel("FLOW")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  const message = await channel.send({
    embeds: [matchEmbed()],
    components: [mainButtons()]
  });

  const collector =
    message.createMessageComponentCollector({
      time: 120000
    });

  collector.on("collect", async interaction => {
    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "This isn't your match.",
        ephemeral: true
      });
    }

    if (ended) {
      return interaction.reply({
        content: "The match has already ended.",
        ephemeral: true
      });
    }

    const action = interaction.customId.split(":")[0];

    // ===========================
    // FLOW MENU
    // ===========================

    if (action === "flow") {
      if (!user.activeFlow) {
        return interaction.reply({
          content:
            "You don't have an active Flow. Unlock one with `,unlockflow <flow>`.",
          ephemeral: true
        });
      }

      const flow = FLOWS[user.activeFlow];

      const rows = [];

      for (let i = 0; i < flow.abilities.length; i += 5) {
        const row = new ActionRowBuilder();

        for (
          let j = i;
          j < Math.min(i + 5, flow.abilities.length);
          j++
        ) {
          const ability = flow.abilities[j];

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(
                `ability:${userId}:${j}`
              )
              .setLabel(ability.name.slice(0, 80))
              .setStyle(ButtonStyle.Secondary)
          );
        }

        rows.push(row);
      }

      return interaction.reply({
        content:
          `🔥 **${user.activeFlow} Flow**\nChoose an ability:`,
        components: rows,
        ephemeral: true
      });
    }

    // ===========================
    // NORMAL ACTIONS
    // ===========================

    if (
      ["shoot", "pass", "dribble"].includes(action)
    ) {
      chances--;

      let success = false;

      if (ownerMode) {
        success = true;
      } else {
        let baseChance = 50;

        if (action === "shoot") {
          baseChance =
            48 + (user.rating - opponent.rating) * 2;
        }

        if (action === "pass") {
          baseChance =
            58 + (user.rating - opponent.rating) * 1.5;
        }

        if (action === "dribble") {
          baseChance =
            50 + (user.rating - opponent.rating) * 1.7;
        }

        baseChance = clamp(
          baseChance,
          15,
          92
        );

        success =
          Math.random() * 100 < baseChance;
      }

      let status;

      if (success) {
        if (action === "shoot") {
          goals++;
          rating += 0.8;
          status = "⚽ GOAL! Your shot succeeded!";
        }

        if (action === "pass") {
          assists++;
          rating += 0.5;
          status = "🎯 Perfect pass!";
        }

        if (action === "dribble") {
          rating += 0.4;
          status = "🔥 You beat the defender!";
        }
      } else {
        rating -= 0.2;

        status =
          action === "shoot"
            ? "❌ Your shot was blocked."
            : action === "pass"
            ? "❌ Your pass was intercepted."
            : "❌ The defender stopped your dribble.";
      }

      if (!ownerMode) {
        user.stamina = Math.max(
          0,
          user.stamina -
            (action === "dribble" ? 5 : 3)
        );
      }

      await interaction.update({
        embeds: [matchEmbed(status)],
        components:
          chances > 0
            ? [mainButtons()]
            : []
      });

      if (chances <= 0) {
        await finishMatch();
      }

      saveDB();
    }
  });

  async function finishMatch() {
    if (ended) return;

    ended = true;
    collector.stop();

    const opponentGoals = ownerMode
      ? 0
      : random(0, 2);

    let result;

    if (goals > opponentGoals) {
      result = "WIN";
    } else if (goals === opponentGoals) {
      result = "DRAW";
    } else {
      result = "LOSS";
    }

    user.stats.matches++;
    user.stats.goals += goals;
    user.stats.assists += assists;

    if (result === "WIN") {
      user.stats.wins++;
    }

    if (result === "DRAW") {
      user.stats.draws++;
    }

    if (result === "LOSS") {
      user.stats.losses++;
    }

    user.stats.bestRating =
      Math.max(
        user.stats.bestRating,
        rating
      );

    const xp =
      50 +
      goals * 25 +
      (result === "WIN" ? 30 : 0);

    addXP(user, xp);

    if (!ownerMode) {
      user.stamina = Math.max(
        0,
        user.stamina - 10
      );
    } else {
      user.stamina = 100;
    }

    if (result === "WIN") {
      user.rating = clamp(
        user.rating + 1,
        1,
        99
      );
    }

    if (result === "DRAW") {
      user.rating = clamp(
        user.rating + 0.3,
        1,
        99
      );
    }

    if (result === "LOSS") {
      user.rating = clamp(
        user.rating - 0.1,
        1,
        99
      );
    }

    if (rating >= 8.5) {
      const club = opponent.club;

      user.clubInterest[club] =
        (user.clubInterest[club] || 0) + 15;

      if (
        user.clubInterest[club] >= 50 &&
        Math.random() < 0.35
      ) {
        user.offers.push({
          club,
          value:
            Math.floor(
              user.transferValue *
                (1 + Math.random())
            )
        });
      }
    }

    saveDB();

    await message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `🏁 Match Finished — ${result}`
          )
          .setDescription(
            `**${player.name}** vs **${opponent.name}**\n\n` +
            `Score: **${goals} - ${opponentGoals}**\n\n` +
            `⚽ Goals: **${goals}**\n` +
            `🎯 Assists: **${assists}**\n` +
            `⭐ Rating: **${rating.toFixed(1)}**\n` +
            `📈 OVR: **${user.rating}**\n` +
            `✨ XP: **+${xp}**\n\n` +
            (ownerMode
              ? "👑 **OWNER MODE:** Every action succeeded and stamina was unlimited."
              : "")
          )
      ],
      components: []
    });
  }
}

// ===============================
// COMMAND HANDLER
// ===============================

async function handleCommand(message, args) {
  const userId = message.author.id;
  const user = getUser(userId);

  const command =
    (args.shift() || "").toLowerCase();

  // ===========================
  // HELP
  // ===========================

  if (command === "help") {
    return message.reply(
      `**⚽ BLUE LOCK RPG**\n\n` +
      `\`${PREFIX}profile\`\n` +
      `\`${PREFIX}roll\`\n` +
      `\`${PREFIX}players\`\n` +
      `\`${PREFIX}character <name>\`\n` +
      `\`${PREFIX}setplayer <name>\`\n` +
      `\`${PREFIX}match\`\n` +
      `\`${PREFIX}skills\`\n` +
      `\`${PREFIX}flows\`\n` +
      `\`${PREFIX}flow\`\n` +
      `\`${PREFIX}unlockflow <flow>\`\n` +
      `\`${PREFIX}setflow <flow>\`\n` +
      `\`${PREFIX}train <stat>\`\n` +
      `\`${PREFIX}rest\`\n` +
      `\`${PREFIX}stats\`\n` +
      `\`${PREFIX}career\`\n` +
      `\`${PREFIX}balance\`\n` +
      `\`${PREFIX}trophies\`\n` +
      `\`${PREFIX}interest\`\n` +
      `\`${PREFIX}offers\`\n` +
      `\`${PREFIX}transfer <club>\``
    );
  }

  // ===========================
  // PROFILE
  // ===========================

  if (command === "profile") {
    return message.reply(
      `**${message.author.username}'s Blue Lock Profile**\n\n` +
      `⭐ OVR: **${user.rating}**\n` +
      `📈 Level: **${user.level}**\n` +
      `🏆 Career: **${user.career}**\n` +
      `🇯🇵 Country: **${user.country}**\n` +
      `🏟️ Club: **${user.club}**\n` +
      `👤 Player: **${user.activePlayer || "None"}**\n` +
      `🔥 Flow: **${user.activeFlow || "None"}**\n` +
      `⚡ Stamina: **${
        isOwner(userId)
          ? "∞"
          : user.stamina + "%"
      }**\n` +
      `💰 Coins: **${user.coins.toLocaleString()}**\n` +
      `💎 Gems: **${user.gems.toLocaleString()}**`
    );
  }

  // ===========================
  // ROLL
  // ===========================

  if (command === "roll") {
    const result = rollCharacter();
    const player = result.player;

    if (!user.players.includes(player.name)) {
      user.players.push(player.name);
    }

    if (!user.activePlayer) {
      user.activePlayer = player.name;
    }

    if (
      player.flow &&
      !user.unlockedFlows.includes(player.flow)
    ) {
      user.unlockedFlows.push(player.flow);
    }

    saveDB();

    return message.reply(
      `🎴 **${result.rarity} ROLL**\n\n` +
      `👤 **${player.name}**\n` +
      `⭐ Rating: **${player.rating}**\n` +
      `📍 Position: **${player.position}**\n` +
      `🏟️ Club: **${player.club}**\n` +
      `🔥 Flow: **${player.flow || "None"}**\n\n` +
      `Skills:\n${player.skills
        .map(x => `• ${x}`)
        .join("\n")}`
    );
  }

  // ===========================
  // PLAYERS
  // ===========================

  if (command === "players") {
    if (!user.players.length) {
      return message.reply(
        "You don't own any characters yet."
      );
    }

    return message.reply(
      user.players
        .map(
          (name, i) =>
            `${i + 1}. **${name}** — ${
              PLAYERS[name]?.rating || "?"
            } OVR`
        )
        .join("\n")
    );
  }

  // ===========================
  // CHARACTER
  // ===========================

  if (command === "character") {
    const name = resolvePlayer(
      args.join(" ")
    );

    if (!name) {
      return message.reply(
        "Character not found."
      );
    }

    const player = PLAYERS[name];

    return message.reply(
      `**${player.name}**\n\n` +
      `⭐ Rating: **${player.rating}**\n` +
      `📍 Position: **${player.position}**\n` +
      `🌎 Country: **${player.country}**\n` +
      `🏟️ Club: **${player.club}**\n` +
      `🔥 Flow: **${player.flow || "None"}**\n\n` +
      `**Skills**\n` +
      player.skills.map(x => `• ${x}`).join("\n")
    );
  }

  // ===========================
  // SET PLAYER
  // ===========================

  if (command === "setplayer") {
    const name = resolvePlayer(
      args.join(" ")
    );

    if (
      !name ||
      !user.players.includes(name)
    ) {
      return message.reply(
        "You don't own that character."
      );
    }

    user.activePlayer = name;
    saveDB();

    return message.reply(
      `Your active character is now **${name}**.`
    );
  }

  // ===========================
  // MATCH
  // ===========================

  if (command === "match") {
    return startMatch(
      userId,
      message.channel
    );
  }

  // ===========================
  // SKILLS
  // ===========================

  if (command === "skills") {
    if (!user.activePlayer) {
      return message.reply(
        "Set an active character first."
      );
    }

    const player =
      PLAYERS[user.activePlayer];

    let output =
      `**${player.name} Skills**\n\n`;

    output +=
      player.skills
        .map(x => `⚽ ${x}`)
        .join("\n");

    if (
      player.flow &&
      FLOWS[player.flow]
    ) {
      output +=
        `\n\n**Flow Skills — ${player.flow}**\n`;

      output += FLOWS[player.flow].abilities
        .map(x => `🔥 ${x.name}`)
        .join("\n");
    }

    return message.reply(output);
  }

  // ===========================
  // FLOWS
  // ===========================

  if (command === "flows") {
    return message.reply(
      Object.entries(FLOWS)
        .map(
          ([name, flow]) =>
            `🔥 **${name}** — ${flow.rarity} — ${flow.requiredRating} OVR\n` +
            flow.abilities
              .map(x => `• ${x.name}`)
              .join("\n")
        )
        .join("\n\n")
    );
  }

  if (command === "flow") {
    if (!user.activeFlow) {
      return message.reply(
        "You don't have an active Flow."
      );
    }

    const flow =
      FLOWS[user.activeFlow];

    return message.reply(
      `🔥 **${user.activeFlow} Flow**\n\n` +
      `Rarity: **${flow.rarity}**\n` +
      `Required OVR: **${flow.requiredRating}**\n\n` +
      flow.abilities
        .map(
          x =>
            `• **${x.name}** — Power ${x.power} | Stamina ${x.stamina} | CD ${x.cooldown}`
        )
        .join("\n")
    );
  }

  if (command === "unlockflow") {
    const flowName = resolveFlow(
      args.join(" ")
    );

    if (!flowName) {
      return message.reply(
        "Flow not found."
      );
    }

    return message.reply(
      unlockFlow(
        user,
        flowName,
        userId
      )
    );
  }

  if (command === "setflow") {
    const flowName = resolveFlow(
      args.join(" ")
    );

    if (
      !flowName ||
      !user.unlockedFlows.includes(
        flowName
      )
    ) {
      return message.reply(
        "You haven't unlocked that Flow."
      );
    }

    user.activeFlow = flowName;
    saveDB();

    return message.reply(
      `🔥 Active Flow set to **${flowName}**.`
    );
  }

  // ===========================
  // TRAIN
  // ===========================

  if (command === "train") {
    const stat =
      (args[0] || "").toLowerCase();

    const valid = [
      "shooting",
      "passing",
      "dribbling",
      "speed",
      "defense",
      "physical",
      "vision"
    ];

    if (!valid.includes(stat)) {
      return message.reply(
        `Use: ${valid.join(", ")}`
      );
    }

    if (
      !isOwner(userId) &&
      user.stamina < 10
    ) {
      return message.reply(
        "You're too tired. Use `,rest`."
      );
    }

    if (!isOwner(userId)) {
      user.stamina -= 10;
    }

    user.rating =
      clamp(
        user.rating + 1,
        1,
        99
      );

    addXP(user, 25);

    saveDB();

    return message.reply(
      `💪 Training complete!\n\n` +
      `Stat: **${stat} +1**\n` +
      `OVR: **${user.rating}**\n` +
      `XP: **+25**\n` +
      `Stamina: **${
        isOwner(userId)
          ? "∞"
          : user.stamina + "%"
      }**`
    );
  }

  // ===========================
  // REST
  // ===========================

  if (command === "rest") {
    user.stamina = 100;
    saveDB();

    return message.reply(
      "⚡ You are fully rested."
    );
  }

  // ===========================
  // STATS
  // ===========================

  if (command === "stats") {
    const s = user.stats;

    return message.reply(
      `**Match Stats**\n\n` +
      `Matches: **${s.matches}**\n` +
      `Wins: **${s.wins}**\n` +
      `Draws: **${s.draws}**\n` +
      `Losses: **${s.losses}**\n` +
      `Goals: **${s.goals}**\n` +
      `Assists: **${s.assists}**\n` +
      `Best Rating: **${s.bestRating.toFixed(1)}**`
    );
  }

  // ===========================
  // CAREER
  // ===========================

  if (command === "career") {
    return message.reply(
      `🏆 **Career**\n\n` +
      `Career: **${user.career}**\n` +
      `Level: **${user.level}**\n` +
      `XP: **${user.xp}/${xpNeeded(
        user.level
      )}**\n` +
      `OVR: **${user.rating}**`
    );
  }

  // ===========================
  // BALANCE
  // ===========================

  if (command === "balance") {
    return message.reply(
      `💰 Coins: **${user.coins.toLocaleString()}**\n` +
      `💎 Gems: **${user.gems.toLocaleString()}**`
    );
  }

  // ===========================
  // TROPHIES
  // ===========================

  if (command === "trophies") {
    return message.reply(
      user.trophies.length
        ? user.trophies
            .map(x => `🏆 ${x}`)
            .join("\n")
        : "You haven't won any trophies."
    );
  }

  // ===========================
  // INTEREST
  // ===========================

  if (command === "interest") {
    const entries =
      Object.entries(
        user.clubInterest
      );

    if (!entries.length) {
      return message.reply(
        "No clubs are interested yet."
      );
    }

    return message.reply(
      entries
        .map(
          ([club, interest]) =>
            `🏟️ **${club}** — ${interest}%`
        )
        .join("\n")
    );
  }

  // ===========================
  // OFFERS
  // ===========================

  if (command === "offers") {
    if (!user.offers.length) {
      return message.reply(
        "You have no transfer offers."
      );
    }

    return message.reply(
      user.offers
        .map(
          (offer, i) =>
            `${i + 1}. **${offer.club}** — 💰 ${offer.value.toLocaleString()}`
        )
        .join("\n")
    );
  }

  // ===========================
  // TRANSFER
  // ===========================

  if (command === "transfer") {
    const club = resolveClub(
      args.join(" ")
    );

    if (!club) {
      return message.reply(
        "Club not found."
      );
    }

    user.club = club;

    saveDB();

    return message.reply(
      `🏟️ You transferred to **${club}**.`
    );
  }

  // ==================================================
  // OWNER COMMANDS
  // ==================================================

  if (isOwner(userId)) {

    if (command === "ownerhelp") {
      return message.reply(
        `👑 **OWNER COMMANDS**\n\n` +
        `\`,rob\`\n` +
        `\`,givechar @user <character>\`\n` +
        `\`,givecoins @user <amount>\`\n` +
        `\`,givegems @user <amount>\`\n` +
        `\`,giveflow @user <flow>\`\n` +
        `\`,setrating @user <rating>\`\n` +
        `\`,setlevel @user <level>\`\n` +
        `\`,setclub @user <club>\`\n` +
        `\`,setcountry @user <country>\`\n` +
        `\`,resetplayer @user\``
      );
    }

    // ROB

    if (command === "rob") {
      user.coins += 1_000_000_000;
      user.gems += 100_000;
      user.rating = 99;
      user.level = 100;
      user.stamina = 100;

      saveDB();

      return message.reply(
        `👑 **OWNER MODE ACTIVATED**\n\n` +
        `💰 +1,000,000,000 Coins\n` +
        `💎 +100,000 Gems\n` +
        `⭐ 99 OVR\n` +
        `📈 Level 100\n` +
        `⚡ Infinite Stamina`
      );
    }

    // GIVE CHARACTER

    if (command === "givechar") {
      const target =
        message.mentions.users.first();

      const name = resolvePlayer(
        args
          .slice(1)
          .join(" ")
      );

      if (!target || !name) {
        return message.reply(
          "Usage: `,givechar @user <character>`"
        );
      }

      const targetData =
        getUser(target.id);

      if (
        !targetData.players.includes(
          name
        )
      ) {
        targetData.players.push(name);
      }

      if (!targetData.activePlayer) {
        targetData.activePlayer = name;
      }

      const flow =
        PLAYERS[name].flow;

      if (
        flow &&
        !targetData.unlockedFlows.includes(
          flow
        )
      ) {
        targetData.unlockedFlows.push(
          flow
        );
      }

      saveDB();

      return message.reply(
        `👑 Gave **${name}** to ${target}.`
      );
    }

    // GIVE COINS / GEMS

    if (
      command === "givecoins" ||
      command === "givegems"
    ) {
      const target =
        message.mentions.users.first();

      const amount =
        Number(args[1]);

      if (
        !target ||
        !Number.isFinite(amount)
      ) {
        return message.reply(
          `Usage: \`,${command} @user <amount>\``
        );
      }

      const targetData =
        getUser(target.id);

      if (command === "givecoins") {
        targetData.coins += amount;
      } else {
        targetData.gems += amount;
      }

      saveDB();

      return message.reply(
        `👑 Gave **${amount.toLocaleString()}** ${
          command === "givecoins"
            ? "coins"
            : "gems"
        } to ${target}.`
      );
    }

    // GIVE FLOW

    if (command === "giveflow") {
      const target =
        message.mentions.users.first();

      const flowName =
        resolveFlow(
          args.slice(1).join(" ")
        );

      if (!target || !flowName) {
        return message.reply(
          "Usage: `,giveflow @user <flow>`"
        );
      }

      const targetData =
        getUser(target.id);

      if (
        !targetData.unlockedFlows.includes(
          flowName
        )
      ) {
        targetData.unlockedFlows.push(
          flowName
        );
      }

      targetData.activeFlow =
        flowName;

      saveDB();

      return message.reply(
        `👑 Gave **${flowName} Flow** to ${target}.`
      );
    }

    // SET RATING

    if (command === "setrating") {
      const target =
        message.mentions.users.first();

      const rating =
        Number(args[1]);

      if (!target || !Number.isFinite(rating)) {
        return message.reply(
          "Usage: `,setrating @user <rating>`"
        );
      }

      const targetData =
        getUser(target.id);

      targetData.rating =
        clamp(rating, 1, 99);

      saveDB();

      return message.reply(
        `👑 Set ${target}'s rating to **${targetData.rating}**.`
      );
    }

    // SET LEVEL

    if (command === "setlevel") {
      const target =
        message.mentions.users.first();

      const level =
        Number(args[1]);

      if (!target || !Number.isFinite(level)) {
        return message.reply(
          "Usage: `,setlevel @user <level>`"
        );
      }

      const targetData =
        getUser(target.id);

      targetData.level =
        Math.max(1, level);

      saveDB();

      return message.reply(
        `👑 Set ${target}'s level to **${targetData.level}**.`
      );
    }

    // SET CLUB

    if (command === "setclub") {
      const target =
        message.mentions.users.first();

      const club =
        resolveClub(
          args.slice(1).join(" ")
        );

      if (!target || !club) {
        return message.reply(
          "Usage: `,setclub @user <club>`"
        );
      }

      const targetData =
        getUser(target.id);

      targetData.club =
        club;

      saveDB();

      return message.reply(
        `👑 Set ${target}'s club to **${club}**.`
      );
    }

    // SET COUNTRY

    if (command === "setcountry") {
      const target =
        message.mentions.users.first();

      const country =
        args
          .slice(1)
          .join(" ");

      if (!target || !country) {
        return message.reply(
          "Usage: `,setcountry @user <country>`"
        );
      }

      const targetData =
        getUser(target.id);

      targetData.country =
        country;

      saveDB();

      return message.reply(
        `👑 Set ${target}'s country to **${country}**.`
      );
    }

    // RESET PLAYER

    if (command === "resetplayer") {
      const target =
        message.mentions.users.first();

      if (!target) {
        return message.reply(
          "Mention a user."
        );
      }

      delete db.players[target.id];

      saveDB();

      return message.reply(
        `👑 Reset ${target}'s RPG data.`
      );
    }
  }

  return;
}

// ===============================
// PREFIX COMMANDS
// ===============================

client.on(
  "messageCreate",
  async message => {
    if (message.author.bot) return;

    if (
      !message.content.startsWith(
        PREFIX
      )
    ) {
      return;
    }

    const args =
      message.content
        .slice(PREFIX.length)
        .trim()
        .split(/\s+/);

    try {
      await handleCommand(
        message,
        args
      );
    } catch (error) {
      console.error(error);

      message.reply(
        "❌ Something went wrong while running that command."
      );
    }
  }
);

// ===============================
// SLASH COMMANDS
// ===============================

const slashCommands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your Blue Lock profile"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a Blue Lock character"),

  new SlashCommandBuilder()
    .setName("players")
    .setDescription("Show your characters"),

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
    .setName("match")
    .setDescription("Start a Blue Lock match"),

  new SlashCommandBuilder()
    .setName("flows")
    .setDescription("Show all Flow Styles"),

  new SlashCommandBuilder()
    .setName("flow")
    .setDescription("Show your active Flow"),

  new SlashCommandBuilder()
    .setName("unlockflow")
    .setDescription("Unlock a Flow")
    .addStringOption(option =>
      option
        .setName("flow")
        .setDescription("Flow name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setflow")
    .setDescription("Set your active Flow")
    .addStringOption(option =>
      option
        .setName("flow")
        .setDescription("Flow name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("skills")
    .setDescription("Show your character's skills"),

  new SlashCommandBuilder()
    .setName("train")
    .setDescription("Train your player")
    .addStringOption(option =>
      option
        .setName("stat")
        .setDescription("Stat to train")
        .setRequired(true)
        .addChoices(
          { name: "Shooting", value: "shooting" },
          { name: "Passing", value: "passing" },
          { name: "Dribbling", value: "dribbling" },
          { name: "Speed", value: "speed" },
          { name: "Defense", value: "defense" },
          { name: "Physical", value: "physical" },
          { name: "Vision", value: "vision" }
        )
    ),

  new SlashCommandBuilder()
    .setName("rest")
    .setDescription("Restore stamina"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show match stats"),

  new SlashCommandBuilder()
    .setName("career")
    .setDescription("Show your career"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Show coins and gems"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("Show trophies"),

  new SlashCommandBuilder()
    .setName("interest")
    .setDescription("Show club interest"),

  new SlashCommandBuilder()
    .setName("offers")
    .setDescription("Show transfer offers"),

  new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer clubs")
    .addStringOption(option =>
      option
        .setName("club")
        .setDescription("Club name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setplayer")
    .setDescription("Set active character")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Character name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show commands")
].map(command => command.toJSON());

// ===============================
// SLASH HANDLER
// ===============================

client.on(
  "interactionCreate",
  async interaction => {
    if (
      !interaction.isChatInputCommand()
    ) {
      return;
    }

    const command =
      interaction.commandName;

    const args = [];

    for (
      const option of interaction.options.data
    ) {
      if (
        option.value !== undefined
      ) {
        args.push(
          String(option.value)
        );
      }
    }

    const fakeMessage = {
      author: interaction.user,
      channel: interaction.channel,

      reply: async content => {
        if (
          interaction.replied ||
          interaction.deferred
        ) {
          return interaction.followUp(
            typeof content === "string"
              ? { content }
              : content
          );
        }

        return interaction.reply(
          typeof content === "string"
            ? { content }
            : content
        );
      }
    };

    try {
      await handleCommand(
        fakeMessage,
        [command, ...args]
      );
    } catch (error) {
      console.error(error);

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply(
          "❌ Command failed."
        );
      }
    }
  }
);

// ===============================
// REGISTER SLASH COMMANDS
// ===============================

async function registerCommands() {
  if (!CLIENT_ID) {
    console.log(
      "CLIENT_ID missing, skipping slash registration."
    );
    return;
  }

  const rest =
    new REST({ version: "10" })
      .setToken(TOKEN);

  if (GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: slashCommands
      }
    );

    console.log(
      "Guild slash commands registered."
    );
  } else {
    await rest.put(
      Routes.applicationCommands(
        CLIENT_ID
      ),
      {
        body: slashCommands
      }
    );

    console.log(
      "Global slash commands registered."
    );
  }
}

// ===============================
// READY
// ===============================

client.once(
  "ready",
  async () => {
    console.log(
      `Logged in as ${client.user.tag}`
    );

    try {
      await registerCommands();
    } catch (error) {
      console.error(
        "Slash registration error:",
        error
      );
    }
  }
);

// ===============================
// LOGIN
// ===============================

client.login(TOKEN);
