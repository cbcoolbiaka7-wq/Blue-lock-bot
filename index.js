const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
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
  console.error("Missing DISCORD_TOKEN.");
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
  season: 1
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    console.log("Creating fresh database.");
  }
}

db.users ||= {};
db.season ||= 1;

function saveDB() {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(db, null, 2)
  );
}

/* =========================================================
   HELPERS
========================================================= */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function money(n) {
  return Number(n || 0).toLocaleString();
}

function xpNeeded(level) {
  return 100 + level * 75;
}

/* =========================================================
   CLUBS
========================================================= */

const CLUBS = {
  "Bastard München": 97,
  "Paris X Gen": 96,
  "Manshine City": 91,
  "FC Barcha": 89,
  "Ubers": 92,

  "Real Madrid": 95,
  "Barcelona": 92,
  "Manchester City": 94,
  "Liverpool": 92,
  "Arsenal": 91,
  "Manchester United": 88,
  "Chelsea": 87,
  "Bayern Munich": 94,
  "Borussia Dortmund": 89,
  "Bayer Leverkusen": 90,
  "Inter Milan": 91,
  "AC Milan": 88,
  "Juventus": 89,
  "PSG": 94,
  "Marseille": 84,
  "Ajax": 84,
  "PSV": 85,
  "Benfica": 87,
  "Porto": 86
};

const CLUB_ALIASES = {
  bastard: "Bastard München",
  bastardmunchen: "Bastard München",
  bastardmünchen: "Bastard München",
  bm: "Bastard München",

  pxg: "Paris X Gen",
  parisxgen: "Paris X Gen",

  manshine: "Manshine City",
  manshinecity: "Manshine City",

  barcha: "FC Barcha",
  fcbarcha: "FC Barcha",

  uber: "Ubers",
  ubers: "Ubers",

  real: "Real Madrid",
  madrid: "Real Madrid",
  realmadrid: "Real Madrid",

  barca: "Barcelona",
  barcelona: "Barcelona",

  city: "Manchester City",
  mancity: "Manchester City",
  manchestercity: "Manchester City",

  liverpool: "Liverpool",
  lfc: "Liverpool",

  arsenal: "Arsenal",
  gunners: "Arsenal",

  united: "Manchester United",
  manu: "Manchester United",

  chelsea: "Chelsea",

  bayern: "Bayern Munich",
  munich: "Bayern Munich",

  dortmund: "Borussia Dortmund",
  bvb: "Borussia Dortmund",

  leverkusen: "Bayer Leverkusen",

  inter: "Inter Milan",
  intermilan: "Inter Milan",

  milan: "AC Milan",
  acmilan: "AC Milan",

  juve: "Juventus",
  juventus: "Juventus",

  psg: "PSG",
  paris: "PSG",

  marseille: "Marseille",
  ajax: "Ajax",
  psv: "PSV",
  benfica: "Benfica",
  porto: "Porto"
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
  japan: "Japan",

  ger: "Germany",
  german: "Germany",
  germany: "Germany",

  fra: "France",
  france: "France",

  bra: "Brazil",
  brazil: "Brazil",

  arg: "Argentina",
  argentina: "Argentina",

  eng: "England",
  england: "England",
  uk: "England",

  esp: "Spain",
  spain: "Spain",

  ita: "Italy",
  italy: "Italy",

  por: "Portugal",
  portugal: "Portugal",

  holland: "Netherlands",
  netherlands: "Netherlands",

  belgium: "Belgium",
  croatia: "Croatia",
  nigeria: "Nigeria",

  korea: "South Korea",
  skorea: "South Korea",
  southkorea: "South Korea",

  mexico: "Mexico",
  usa: "USA",
  america: "USA"
};

/* =========================================================
   55+ PLAYERS
========================================================= */

const PLAYER_DATA = [
  ["Yoichi Isagi", "isagi", 91, "Legendary", "ST", "Japan", "Bastard München",
    ["Meta Vision", "Direct Shot", "Spatial Awareness", "Two-Gun Volley", "Adaptation"]],

  ["Michael Kaiser", "kaiser", 98, "Secret", "ST", "Germany", "Bastard München",
    ["Kaiser Impact", "Kaiser Impact Magnus", "Meta Vision", "Predator Eye", "Emperor Aura"]],

  ["Noel Noa", "noa", 99, "Secret", "ST", "Germany", "Bastard München",
    ["World's Best", "Perfect Ambidexterity", "Complete Striker", "Physical Mastery", "Adaptation"]],

  ["Rin Itoshi", "rin", 96, "Mythic", "ST", "Japan", "Paris X Gen",
    ["Destroyer Mode", "Puppet Control", "Flow", "Curve Shot", "Spatial Reading"]],

  ["Julian Loki", "loki", 97, "Mythic", "RW", "France", "Paris X Gen",
    ["Godspeed", "Lightning Speed", "Explosive Acceleration", "Speed Burst", "Counter Attack"]],

  ["Lavinho", "lavinho", 94, "Legendary", "LW", "Brazil", "FC Barcha",
    ["Magician", "Creative Dribbling", "Elastic Dribble", "1v1 Mastery", "Brazilian Flair"]],

  ["Meguru Bachira", "bachira", 89, "Epic", "RW", "Japan", "FC Barcha",
    ["Monster", "Dribbling", "Elastic Dribble", "Solo Run", "Creative Passing"]],

  ["Shoei Barou", "barou", 90, "Epic", "ST", "Japan", "Ubers",
    ["Predator Eye", "Charging Drive", "Chop Feint", "King's Presence", "Long Shot"]],

  ["Seishiro Nagi", "nagi", 93, "Legendary", "ST", "Japan", "Manshine City",
    ["Perfect Trapping", "Revolver Shot", "First Touch", "Creativity", "Lazy Genius"]],

  ["Reo Mikage", "reo", 86, "Rare", "CM", "Japan", "Manshine City",
    ["Chameleon", "Copy", "Vision", "Passing", "Versatility"]],

  ["Rensuke Kunigami", "kunigami", 88, "Epic", "ST", "Japan", "Bastard München",
    ["Wild Card", "Lefty Shot", "Power Shot", "Physicality", "Long Range"]],

  ["Oliver Aiku", "aiku", 88, "Epic", "CB", "Japan", "Ubers",
    ["Defense IQ", "Aerial Duel", "Man Marking", "Reading", "Lockdown"]],

  ["Jyubei Aryu", "aryu", 82, "Rare", "CB", "Japan", "Ubers",
    ["Giant Reach", "Aerial Power", "Long Legs", "Clearance", "Marking"]],

  ["Ikki Niko", "niko", 83, "Rare", "CB", "Japan", "Ubers",
    ["Spatial Awareness", "Prediction", "Intercept", "Vision", "Reading"]],

  ["Eita Otoya", "otoya", 84, "Rare", "RW", "Japan", "FC Barcha",
    ["Stealth", "Off-Ball Run", "Speed", "Shadowing", "Quick Finish"]],

  ["Tabito Karasu", "karasu", 87, "Epic", "CM", "Japan", "Paris X Gen",
    ["Ball Control", "Midfield Control", "Feint", "Reading", "Possession"]],

  ["Kenyu Yukimiya", "yukimiya", 87, "Epic", "LW", "Japan", "Bastard München",
    ["Gyro Shot", "Dribbling", "1v1", "Acceleration", "Cut Inside"]],

  ["Hyoma Chigiri", "chigiri", 88, "Epic", "LW", "Japan", "Manshine City",
    ["Speed", "44 Panther Snipe", "Acceleration", "Breakaway", "Dribble"]],

  ["Yo Hiori", "hiori", 85, "Rare", "CM", "Japan", "Bastard München",
    ["Perfect Pass", "Vision", "Through Ball", "Cross", "Awareness"]],

  ["Gagamaru Gin", "gagamaru", 84, "Rare", "GK", "Japan", "Bastard München",
    ["Super Save", "Reflexes", "Acrobatics", "Long Reach", "Instinct"]],

  ["Zantetsu Tsurugi", "zantetsu", 80, "Rare", "RW", "Japan", "Manshine City",
    ["Explosive Speed", "Acceleration", "Direct Run", "Power", "Burst"]],

  ["Kiyoshi Fujimoto", "fujimoto", 78, "Uncommon", "CM", "Japan", "Blue Lock",
    ["Quick Pass", "Vision", "Control", "Movement", "Press"]],

  ["Ryusei Shidou", "shidou", 95, "Mythic", "ST", "Japan", "Paris X Gen",
    ["Big Bang Drive", "Dragon Drive", "Acrobatic Shot", "Flow", "Instinct"]],

  ["Sae Itoshi", "sae", 96, "Mythic", "CM", "Japan", "Real Madrid",
    ["Perfect Pass", "Vision", "Through Ball", "Game Control", "Elite Touch"]],

  ["Don Lorenzo", "lorenzo", 93, "Legendary", "CB", "Italy", "Ubers",
    ["Zombie Defense", "Man Marking", "Steal", "Aerial Duel", "Lockdown"]],

  ["Alexis Ness", "ness", 87, "Epic", "CM", "Germany", "Bastard München",
    ["Magic Pass", "Through Ball", "Curve", "Link Up", "Precision"]],

  ["Kenyu Yukimiya", "yukimiya2", 87, "Epic", "LW", "Japan", "Bastard München",
    ["Gyro Shot", "Dribble", "Acceleration", "1v1", "Cut Inside"]],

  ["Agi", "agi", 86, "Rare", "ST", "England", "Manshine City",
    ["Control", "First Touch", "Shot", "Positioning", "Technique"]],

  ["Chris Prince", "prince", 95, "Mythic", "ST", "England", "Manshine City",
    ["Perfect Body", "Power Shot", "Physicality", "Speed", "Super Striker"]],

  ["Marc Snuffy", "snuffy", 95, "Mythic", "ST", "Italy", "Ubers",
    ["Tactical Vision", "Perfect Strategy", "Passing", "Leadership", "Adaptation"]],

  ["Adam Blake", "blake", 88, "Epic", "ST", "England", "Manshine City",
    ["Power", "Finishing", "Physicality", "Header", "Positioning"]],

  ["Leonardo Luna", "luna", 89, "Epic", "ST", "Spain", "Real Madrid",
    ["Technique", "Dribbling", "Finishing", "Vision", "Flair"]],

  ["Dada Silva", "silva", 90, "Legendary", "ST", "Brazil", "Real Madrid",
    ["Power", "Acceleration", "Shot", "Strength", "Finishing"]],

  ["Pablo Cavasoz", "cavasoz", 88, "Epic", "LW", "Argentina", "FC Barcha",
    ["Dribbling", "Flair", "Curve", "Speed", "Creativity"]],

  ["Darai Miroku", "miroku", 77, "Uncommon", "CB", "Japan", "Blue Lock",
    ["Marking", "Tackle", "Strength", "Clearance", "Press"]],

  ["Junichi Wanima", "wanima", 76, "Uncommon", "ST", "Japan", "Blue Lock",
    ["Press", "Shot", "Movement", "Pass", "Positioning"]],

  ["Shohei Saramadara", "saramadara", 75, "Uncommon", "CM", "Japan", "Blue Lock",
    ["Pass", "Control", "Press", "Movement", "Vision"]],

  ["Asahi Naruhaya", "naruhaya", 74, "Uncommon", "ST", "Japan", "Blue Lock",
    ["Off-Ball Run", "Speed", "Finishing", "Movement", "Press"]],

  ["Wataru Kuon", "kuon", 73, "Common", "CM", "Japan", "Blue Lock",
    ["Passing", "Positioning", "Marking", "Movement", "Press"]],

  ["Gurimu Igarashi", "igaguri", 68, "Common", "ST", "Japan", "Blue Lock",
    ["Malicia", "Dive", "Press", "Movement", "Survival"]],

  ["Yohei Tanaka", "tanaka", 72, "Common", "RW", "Japan", "Blue Lock",
    ["Speed", "Pass", "Dribble", "Shot", "Movement"]],

  ["Kenyu Okawa", "okawa", 74, "Uncommon", "ST", "Japan", "Blue Lock",
    ["Shot", "Movement", "Press", "Control", "Positioning"]],

  ["Ryosuke Kira", "kira", 79, "Rare", "ST", "Japan", "Blue Lock",
    ["Fair Play", "Technique", "Shot", "Control", "Movement"]],

  ["Gin Gagamaru", "gin", 84, "Rare", "GK", "Japan", "Bastard München",
    ["Reflexes", "Acrobatics", "Save", "Reach", "Instinct"]],

  ["Kento Cho", "cho", 76, "Uncommon", "CB", "Japan", "Blue Lock",
    ["Tackle", "Marking", "Strength", "Clearance", "Press"]],

  ["Kenyu Aoba", "aoba", 78, "Uncommon", "CM", "Japan", "Blue Lock",
    ["Pass", "Vision", "Control", "Movement", "Press"]],

  ["Shizuka Haiji", "haiji", 77, "Uncommon", "LW", "Japan", "Blue Lock",
    ["Speed", "Dribble", "Cross", "Shot", "Movement"]],

  ["Kairu Saramadara", "kairu", 78, "Uncommon", "CM", "Japan", "Blue Lock",
    ["Pass", "Control", "Vision", "Press", "Movement"]],

  ["Michael Kaiser Jr", "kaiserjr", 82, "Rare", "ST", "Germany", "Bastard München",
    ["Precision Shot", "Positioning", "Acceleration", "Finishing", "Movement"]],

  ["Noah Kazama", "kazama", 80, "Rare", "ST", "Japan", "Blue Lock",
    ["Power Shot", "Speed", "Finishing", "Movement", "Press"]],

  ["Rinzo Kageyama", "kageyama", 81, "Rare", "CM", "Japan", "Blue Lock",
    ["Vision", "Passing", "Control", "Prediction", "Press"]],

  ["Haruto Shiba", "shiba", 79, "Rare", "RW", "Japan", "Blue Lock",
    ["Dribble", "Speed", "Cross", "Shot", "Movement"]],

  ["Akira Sendo", "sendo", 80, "Rare", "ST", "Japan", "Blue Lock",
    ["Finishing", "Header", "Positioning", "Power", "Movement"]],

  ["Ranze Kurona", "kurona", 83, "Rare", "RB", "Japan", "Bastard München",
    ["Speed", "Link Up", "Passing", "Overlap", "Press"]],

  ["Jingo Raichi", "raichi", 82, "Rare", "CM", "Japan", "Bastard München",
    ["Man Marking", "Stamina", "Press", "Physicality", "Lockdown"]],

  ["Gen Fukaku", "fukaku", 81, "Rare", "GK", "Japan", "Ubers",
    ["Reflexes", "Save", "Reach", "Positioning", "Clearance"]],

  ["Shuto Sendo", "shuto", 79, "Uncommon", "ST", "Japan", "Ubers",
    ["Finishing", "Movement", "Header", "Power", "Positioning"]],

  ["Oliver Aiku Prime", "aikuprime", 91, "Legendary", "CB", "Japan", "Ubers",
    ["Ultimate Defense", "Reading", "Aerial Duel", "Lockdown", "Intercept"]]
];

/* =========================================================
   BUILD PLAYER DATABASE
========================================================= */

const PLAYERS = {};

for (const data of PLAYER_DATA) {
  const [
    name,
    id,
    rating,
    rarity,
    position,
    country,
    club,
    skills
  ] = data;

  PLAYERS[id] = {
    id,
    name,
    rating,
    rarity,
    position,
    country,
    club,
    skills
  };
}

/* =========================================================
   PLAYER ALIASES
========================================================= */

const PLAYER_ALIASES = {
  michael: "kaiser",
  micheal: "kaiser",
  michaelkaiser: "kaiser",
  mikey: "kaiser",

  yoichi: "isagi",
  yoichiisagi: "isagi",

  noel: "noa",
  noelnoa: "noa",

  julian: "loki",
  julianloki: "loki",

  meguru: "bachira",
  megurubachira: "bachira",

  shoei: "barou",
  shoeibarou: "barou",

  seishiro: "nagi",
  seishironagi: "nagi",

  reo: "reo",
  reomikage: "reo",

  itoshi: "rin",
  rinitoshi: "rin",

  ryusei: "shidou",
  shidou: "shidou",

  saeitoshi: "sae",

  chigiri: "chigiri",
  hyoma: "chigiri",

  kurona: "kurona",
  raichi: "raichi"
};

/* =========================================================
   SMART SEARCH
========================================================= */

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);

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

function smartResolve(input, collection, aliases = {}) {
  const query = normalize(input);

  if (!query) return null;

  if (aliases[query]) {
    return aliases[query];
  }

  for (const key of Object.keys(collection)) {
    if (normalize(key) === query) {
      return key;
    }

    if (collection[key]?.name &&
        normalize(collection[key].name) === query) {
      return key;
    }
  }

  let best = null;
  let bestDistance = Infinity;

  for (const key of Object.keys(collection)) {
    const names = [
      key,
      collection[key]?.name,
      ...(collection[key]?.aliases || [])
    ].filter(Boolean);

    for (const name of names) {
      const n = normalize(name);

      if (n.includes(query) || query.includes(n)) {
        return key;
      }

      const distance = levenshtein(
        query,
        n
      );

      const allowed =
        query.length <= 4 ? 1 :
        query.length <= 7 ? 2 :
        3;

      if (
        distance <= allowed &&
        distance < bestDistance
      ) {
        bestDistance = distance;
        best = key;
      }
    }
  }

  return best;
}

function findPlayer(input) {
  const alias = PLAYER_ALIASES[normalize(input)];

  if (alias && PLAYERS[alias]) {
    return alias;
  }

  return smartResolve(
    input,
    PLAYERS
  );
}

function findClub(input) {
  return smartResolve(
    input,
    CLUBS,
    CLUB_ALIASES
  );
}

function findCountry(input) {
  const q = normalize(input);

  if (COUNTRY_ALIASES[q]) {
    return COUNTRY_ALIASES[q];
  }

  let best = null;
  let distance = Infinity;

  for (const country of COUNTRIES) {
    const d = levenshtein(
      q,
      normalize(country)
    );

    if (d < distance) {
      distance = d;
      best = country;
    }
  }

  return distance <= 3 ? best : null;
}

/* =========================================================
   USER
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

      activePlayer: null,
      players: [],

      attributes: {
        shooting: 70,
        passing: 70,
        dribbling: 70,
        speed: 70,
        defense: 60,
        physical: 65,
        vision: 65
      },

      stamina: 100,

      stats: {
        matches: 0,
        appearances: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        draws: 0,
        losses: 0
      },

      seasonStats: {
        matches: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        losses: 0,
        ratingSum: 0
      },

      trophies: [],

      transferValue: 1000000,

      clubInterest: {},

      offers: [],

      cooldowns: {}
    };
  }

  return db.users[id];
}

/* =========================================================
   XP
========================================================= */

function addXP(player, amount) {
  player.xp += amount;

  let levels = 0;

  while (
    player.xp >= xpNeeded(player.level)
  ) {
    player.xp -= xpNeeded(player.level);
    player.level++;
    levels++;
  }

  return levels;
}

/* =========================================================
   SKILLS
========================================================= */

function getActivePlayer(player) {
  return player.activePlayer
    ? PLAYERS[player.activePlayer]
    : null;
}

function skillPower(player, skill) {
  const p = getActivePlayer(player);

  if (!p) return 0;

  let power = p.rating;

  if (
    skill.toLowerCase().includes("shot") ||
    skill.toLowerCase().includes("impact") ||
    skill.toLowerCase().includes("finishing")
  ) {
    power += player.attributes.shooting * 0.2;
  }

  if (
    skill.toLowerCase().includes("drib") ||
    skill.toLowerCase().includes("speed")
  ) {
    power += player.attributes.dribbling * 0.15;
    power += player.attributes.speed * 0.15;
  }

  if (
    skill.toLowerCase().includes("pass") ||
    skill.toLowerCase().includes("vision")
  ) {
    power += player.attributes.passing * 0.15;
    power += player.attributes.vision * 0.15;
  }

  if (
    skill.toLowerCase().includes("def")
  ) {
    power += player.attributes.defense * 0.2;
  }

  return power;
}

/* =========================================================
   TRAINING
========================================================= */

const TRAINING = {
  shooting: {
    name: "Shooting",
    stat: "shooting"
  },

  passing: {
    name: "Passing",
    stat: "passing"
  },

  dribbling: {
    name: "Dribbling",
    stat: "dribbling"
  },

  speed: {
    name: "Speed",
    stat: "speed"
  },

  defense: {
    name: "Defense",
    stat: "defense"
  },

  physical: {
    name: "Physical",
    stat: "physical"
  },

  vision: {
    name: "Vision",
    stat: "vision"
  }
};

function train(player, type) {
  const training = TRAINING[type];

  if (!training) return null;

  if (player.stamina < 20) {
    return {
      success: false,
      message: "You don't have enough stamina."
    };
  }

  player.stamina -= 20;

  const old = player.attributes[
    training.stat
  ];

  const increase = rand(1, 3);

  player.attributes[
    training.stat
  ] = clamp(
    old + increase,
    1,
    99
  );

  const xp = rand(70, 130);

  const levels = addXP(
    player,
    xp
  );

  /*
     Small OVR improvement when
     attributes become stronger.
  */

  const oldOVR = player.rating;

  const average =
    Object.values(player.attributes)
      .reduce((a, b) => a + b, 0) /
    Object.keys(player.attributes).length;

  player.rating = clamp(
    Math.round(
      average +
      (getActivePlayer(player)?.rating || 0) * 0.12
    ),
    50,
    99
  );

  saveDB();

  return {
    success: true,
    training,
    old,
    increase,
    newValue:
      player.attributes[training.stat],
    xp,
    levels,
    oldOVR,
    newOVR: player.rating
  };
}

/* =========================================================
   MATCH ENGINE
========================================================= */

function generateChance(player) {
  const active = getActivePlayer(player);

  if (!active) {
    return {
      type: "normal",
      text: "You received a chance!",
      power: player.rating
    };
  }

  const types = [
    "shoot",
    "pass",
    "dribble",
    "skill"
  ];

  const type =
    types[rand(0, types.length - 1)];

  return {
    type,
    text:
      type === "shoot"
        ? "You are through on goal!"
        : type === "pass"
          ? "A teammate is making a run!"
          : type === "dribble"
            ? "A defender is blocking your path!"
            : "You have a perfect moment to use your ability!",
    power: active.rating
  };
}

function matchButtonRow(player) {
  const active = getActivePlayer(player);

  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("shoot")
        .setLabel("SHOOT")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("pass")
        .setLabel("PASS")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("dribble")
        .setLabel("DRIBBLE")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("skill")
        .setLabel(
          active ? "USE SKILL" : "SKILL"
        )
        .setStyle(ButtonStyle.Secondary)
    );
}

function performAction(
  player,
  action,
  chance,
  opponentStrength
) {
  let stat = 0;

  if (action === "shoot") {
    stat = player.attributes.shooting;
  }

  if (action === "pass") {
    stat = player.attributes.passing;
  }

  if (action === "dribble") {
    stat =
      (player.attributes.dribbling +
        player.attributes.speed) / 2;
  }

  if (action === "skill") {
    stat = skillPower(
      player,
      getActivePlayer(player)?.skills[0] || ""
    );
  }

  const power =
    stat +
    rand(-10, 10);

  const difficulty =
    opponentStrength +
    rand(-10, 10);

  const success =
    power >= difficulty * 0.85;

  let goal = false;
  let assist = false;

  if (action === "shoot" && success) {
    goal = true;
  }

  if (
    action === "skill" &&
    success
  ) {
    const skill =
      getActivePlayer(player)?.skills[0] || "";

    if (
      skill.toLowerCase().includes("shot") ||
      skill.toLowerCase().includes("impact") ||
      skill.toLowerCase().includes("drive") ||
      skill.toLowerCase().includes("finishing")
    ) {
      goal = Math.random() < 0.75;
    } else {
      assist = Math.random() < 0.5;
    }
  }

  if (
    action === "pass" &&
    success
  ) {
    assist = Math.random() < 0.7;
  }

  return {
    success,
    goal,
    assist,
    power
  };
}

/* =========================================================
   CLUB INTEREST
========================================================= */

function updateClubInterest(
  player,
  matchRating
) {
  const interested = [];

  for (const [club, strength] of Object.entries(CLUBS)) {
    if (club === player.club) continue;

    let score = 0;

    score +=
      Math.max(
        0,
        matchRating - 6
      ) * 12;

    score +=
      player.seasonStats.goals * 0.8;

    score +=
      player.seasonStats.assists * 0.5;

    score +=
      Math.max(
        0,
        player.rating - strength + 15
      );

    if (score >= 35) {
      const level =
        score >= 100
          ? "Very High"
          : score >= 75
            ? "High"
            : score >= 50
              ? "Medium"
              : "Low";

      player.clubInterest[club] = {
        score,
        level
      };

      interested.push({
        club,
        score,
        level
      });
    }
  }

  interested.sort(
    (a, b) => b.score - a.score
  );

  return interested.slice(0, 5);
}

function generateOffer(
  player,
  interest
) {
  const offers = [];

  for (const item of interest) {
    if (
      item.level !== "High" &&
      item.level !== "Very High"
    ) continue;

    if (Math.random() > 0.3) continue;

    const fee = Math.max(
      player.transferValue,
      Math.round(
        player.transferValue *
        (1 + Math.random() * 1.5)
      )
    );

    const offer = {
      id:
        `${Date.now()}-${rand(1000, 9999)}`,
      club: item.club,
      fee,
      salary:
        Math.round(
          player.rating *
          rand(1000, 4000)
        ),
      seasons: rand(2, 5),
      status: "pending"
    };

    player.offers.push(offer);
    offers.push(offer);
  }

  return offers;
}

/* =========================================================
   FINALIZE MATCH
========================================================= */

function finishMatch(
  player,
  opponentStrength,
  teamGoals,
  teamAssists,
  opponentGoals
) {
  let result;

  if (teamGoals > opponentGoals) {
    result = "win";
  } else if (
    teamGoals === opponentGoals
  ) {
    result = "draw";
  } else {
    result = "loss";
  }

  let rating = 6;

  rating += teamGoals * 1.15;
  rating += teamAssists * 0.55;

  if (result === "win") rating += 0.8;
  if (result === "draw") rating += 0.2;
  if (result === "loss") rating -= 0.5;

  rating += (Math.random() * 0.5) - 0.25;

  rating = clamp(
    Number(rating.toFixed(1)),
    4.5,
    10
  );

  const oldOVR = player.rating;

  let improvement = 0;

  if (rating >= 9.5) improvement = 2;
  else if (rating >= 8.5) improvement = 1;
  else if (rating < 5.5) improvement = -1;

  player.rating = clamp(
    player.rating + improvement,
    50,
    99
  );

  const xp =
    30 +
    teamGoals * 20 +
    teamAssists * 10 +
    (result === "win" ? 30 : 0) +
    Math.round(rating * 5);

  const coins =
    500 +
    teamGoals * 300 +
    teamAssists * 150 +
    (result === "win" ? 500 : 0);

  player.coins += coins;

  const levels = addXP(
    player,
    xp
  );

  player.stats.matches++;
  player.stats.appearances++;

  player.stats.goals += teamGoals;
  player.stats.assists += teamAssists;

  player.seasonStats.matches++;
  player.seasonStats.goals += teamGoals;
  player.seasonStats.assists += teamAssists;
  player.seasonStats.ratingSum += rating;

  if (result === "win") {
    player.stats.wins++;
    player.seasonStats.wins++;
  }

  if (result === "draw") {
    player.stats.draws++;
  }

  if (result === "loss") {
    player.stats.losses++;
    player.seasonStats.losses++;
  }

  player.transferValue = Math.max(
    100000,
    Math.round(
      player.transferValue *
      (1 + improvement * 0.04)
    )
  );

  const interest =
    updateClubInterest(
      player,
      rating
    );

  const offers =
    generateOffer(
      player,
      interest
    );

  saveDB();

  return {
    result,
    rating,
    oldOVR,
    newOVR: player.rating,
    improvement,
    xp,
    coins,
    levels,
    interest,
    offers
  };
}

/* =========================================================
   MATCH COMMAND
========================================================= */

async function startMatch(
  message,
  player
) {
  if (!getActivePlayer(player)) {
    return message.reply(
      "You need to equip a player first with `,setplayer <name>`."
    );
  }

  if (player.stamina < 30) {
    return message.reply(
      "You are too tired. Train/rest until your stamina recovers."
    );
  }

  player.stamina -= 30;

  const opponentClubNames =
    Object.keys(CLUBS);

  const opponent =
    opponentClubNames[
      rand(0, opponentClubNames.length - 1)
    ];

  const opponentStrength =
    CLUBS[opponent];

  let yourGoals = 0;
  let yourAssists = 0;

  let opponentGoals =
    rand(0, 3);

  const active =
    getActivePlayer(player);

  const embed =
    new EmbedBuilder()
      .setTitle(
        `⚽ MATCH — ${player.club} vs ${opponent}`
      )
      .setDescription(
        [
          `**Your Player:** ${active.name}`,
          `**OVR:** ${active.rating}`,
          "",
          `Your Team: **0**`,
          `Opponent: **${opponentGoals}**`,
          "",
          "🔥 **CHANCE CREATED!**",
          "",
          "Choose your action below."
        ].join("\n")
      );

  const msg =
    await message.reply({
      embeds: [embed],
      components: [
        matchButtonRow(player)
      ]
    });

  const collector =
    msg.createMessageComponentCollector({
      componentType:
        ComponentType.Button,
      time: 60000
    });

  let chances = 0;

  collector.on(
    "collect",
    async interaction => {
      if (
        interaction.user.id !==
        message.author.id
      ) {
        return interaction.reply({
          content:
            "This isn't your match.",
          ephemeral: true
        });
      }

      const action =
        interaction.customId;

      chances++;

      if (action === "skill") {
        const skills =
          active.skills;

        const skill =
          skills[
            rand(0, skills.length - 1)
          ];

        const result =
          performAction(
            player,
            "skill",
            {},
            opponentStrength
          );

        player.stamina =
          clamp(
            player.stamina - 10,
            0,
            100
          );

        if (result.goal) {
          yourGoals++;
        }

        if (result.assist) {
          yourAssists++;
        }

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `⚡ ${skill}`
              )
              .setDescription(
                [
                  result.success
                    ? `**${skill} succeeded!**`
                    : `**${skill} failed!**`,
                  "",
                  result.goal
                    ? "⚽ **GOAL!**"
                    : result.assist
                      ? "🅰️ **ASSIST!**"
                      : "The play didn't produce a goal.",
                  "",
                  `Score: **${yourGoals} - ${opponentGoals}**`,
                  `Stamina: **${player.stamina}/100**`,
                  `Chances used: **${chances}/3**`
                ].join("\n")
              )
          ],
          components:
            chances >= 3
              ? []
              : [matchButtonRow(player)]
        });

      } else {
        const result =
          performAction(
            player,
            action,
            {},
            opponentStrength
          );

        player.stamina =
          clamp(
            player.stamina - 5,
            0,
            100
          );

        if (result.goal) {
          yourGoals++;
        }

        if (result.assist) {
          yourAssists++;
        }

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `⚽ Match — Chance ${chances}/3`
              )
              .setDescription(
                [
                  result.success
                    ? `Your **${action}** succeeded.`
                    : `Your **${action}** failed.`,
                  "",
                  result.goal
                    ? "⚽ **GOAL!**"
                    : result.assist
                      ? "🅰️ **ASSIST!**"
                      : "No direct contribution.",
                  "",
                  `Score: **${yourGoals} - ${opponentGoals}**`,
                  `Stamina: **${player.stamina}/100**`
                ].join("\n")
              )
          ],
          components:
            chances >= 3
              ? []
              : [matchButtonRow(player)]
        });
      }

      if (chances >= 3) {
        collector.stop("finished");
      }
    }
  );

  collector.on(
    "end",
    async () => {
      if (chances === 0) {
        return;
      }

      const final =
        finishMatch(
          player,
          opponentStrength,
          yourGoals,
          yourAssists,
          opponentGoals
        );

      const resultText =
        final.result === "win"
          ? "🏆 VICTORY"
          : final.result === "draw"
            ? "🤝 DRAW"
            : "❌ DEFEAT";

      const interestText =
        final.interest.length
          ? final.interest
              .map(
                x =>
                  `• **${x.club}** — ${x.level}`
              )
              .join("\n")
          : "No new clubs yet.";

      let description = [
        `## ${resultText}`,
        "",
        `**${player.club}** ${yourGoals} - ${opponentGoals} **${opponent}**`,
        "",
        `⚽ Goals: **${yourGoals}**`,
        `🅰️ Assists: **${yourAssists}**`,
        `⭐ Match Rating: **${final.rating}**`,
        "",
        `📈 OVR: **${final.oldOVR} → ${final.newOVR}**`,
        `Improvement: **${final.improvement >= 0 ? "+" : ""}${final.improvement} OVR**`,
        "",
        `✨ XP: **+${final.xp}**`,
        `💰 Coins: **+${money(final.coins)}**`,
        `🔋 Stamina: **${player.stamina}/100**`,
        "",
        "## 👀 Club Interest",
        interestText
      ];

      if (final.offers.length) {
        description.push(
          "",
          "## 📨 Transfer Offer"
        );

        for (const offer of final.offers) {
          description.push(
            `**${offer.club}** — ¥${money(offer.fee)}`
          );
        }

        description.push(
          "",
          "Use `,offers` to view your offers."
        );
      }

      if (final.levels > 0) {
        description.push(
          "",
          `🎉 **LEVEL UP!** +${final.levels}`
        );
      }

      await msg.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `Match Finished — Season ${db.season}`
            )
            .setDescription(
              description.join("\n")
            )
        ],
        components: []
      }).catch(() => {});
    }
  );
}

/* =========================================================
   COMMAND HANDLER
========================================================= */

async function command(
  name,
  args,
  message
) {
  const player =
    getUser(message.author.id);

  /* PROFILE */

  if (name === "profile") {
    const active =
      getActivePlayer(player);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `${message.author.username}'s Career`
          )
          .setDescription(
            [
              `**Season:** ${db.season}`,
              `**Level:** ${player.level}`,
              `**XP:** ${player.xp}/${xpNeeded(player.level)}`,
              `**OVR:** ${player.rating}`,
              `**Position:** ${player.position}`,
              `**Country:** ${player.country}`,
              `**Club:** ${player.club}`,
              `**Career:** ${player.career}`,
              `**Transfer Value:** ¥${money(player.transferValue)}`,
              "",
              `**Player:** ${active?.name || "None"}`,
              "",
              `⚽ Goals: ${player.stats.goals}`,
              `🅰️ Assists: ${player.stats.assists}`,
              `🎮 Matches: ${player.stats.matches}`,
              `🏆 Trophies: ${player.trophies.length}`
            ].join("\n")
          )
      ]
    });
  }

  /* ROLL */

  if (name === "roll") {
    const weights = {
      Common: 50,
      Uncommon: 25,
      Rare: 13,
      Epic: 7,
      Legendary: 3.5,
      Mythic: 1.2,
      Secret: 0.3
    };

    let roll =
      Math.random() * 100;

    let rarity = "Common";

    for (const [r, chance] of Object.entries(weights)) {
      if (roll <= chance) {
        rarity = r;
        break;
      }

      roll -= chance;
    }

    const choices =
      Object.entries(PLAYERS)
        .filter(
          ([_, p]) =>
            p.rarity === rarity
        );

    const [id, rolled] =
      choices.length
        ? choices[rand(0, choices.length - 1)]
        : Object.entries(PLAYERS)[
            rand(
              0,
              Object.keys(PLAYERS).length - 1
            )
          ];

    const duplicate =
      player.players.includes(id);

    if (!duplicate) {
      player.players.push(id);
    } else {
      player.coins += 1000;
    }

    saveDB();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎰 CHARACTER ROLL")
          .setDescription(
            [
              `# ${rolled.name}`,
              "",
              `**Rarity:** ${rolled.rarity}`,
              `**OVR:** ${rolled.rating}`,
              `**Position:** ${rolled.position}`,
              `**Country:** ${rolled.country}`,
              `**Club:** ${rolled.club}`,
              "",
              "**Skills**",
              rolled.skills
                .map(x => `• ${x}`)
                .join("\n"),
              "",
              duplicate
                ? "Duplicate → **+1,000 coins**"
                : "✨ Added to your collection!"
            ].join("\n")
          )
      ]
    });
  }

  /* CHARACTER */

  if (name === "character" ||
      name === "player") {
    const input =
      args.join(" ");

    const id =
      findPlayer(input);

    if (!id) {
      return message.reply(
        "I couldn't find that player. Try their first name, surname, or nickname."
      );
    }

    const p =
      PLAYERS[id];

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `⚽ ${p.name}`
          )
          .setDescription(
            [
              `**OVR:** ${p.rating}`,
              `**Rarity:** ${p.rarity}`,
              `**Position:** ${p.position}`,
              `**Country:** ${p.country}`,
              `**Club:** ${p.club}`,
              "",
              "## Skills",
              p.skills
                .map(
                  (x, i) =>
                    `**${i + 1}.** ${x}`
                )
                .join("\n")
            ].join("\n")
          )
      ]
    });
  }

  /* PLAYERS */

  if (name === "players" ||
      name === "characters") {
    if (!player.players.length) {
      return message.reply(
        "You don't own any players yet. Use `,roll`."
      );
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `${message.author.username}'s Players`
          )
          .setDescription(
            player.players
              .map(id => {
                const p =
                  PLAYERS[id];

                return p
                  ? `• **${p.name}** — ${p.rating} OVR — ${p.rarity}`
                  : id;
              })
              .join("\n")
          )
      ]
    });
  }

  /* SET PLAYER */

  if (name === "setplayer" ||
      name === "setcharacter") {
    const id =
      findPlayer(args.join(" "));

    if (!id) {
      return message.reply(
        "Player not found."
      );
    }

    if (
      !player.players.includes(id)
    ) {
      return message.reply(
        `You don't own **${PLAYERS[id].name}**.`
      );
    }

    player.activePlayer = id;

    const active =
      PLAYERS[id];

    player.position =
      active.position;

    saveDB();

    return message.reply(
      `⚽ Equipped **${active.name}**.`
    );
  }

  /* MATCH */

  if (name === "match" ||
      name === "play") {
    return startMatch(
      message,
      player
    );
  }

  /* TRAIN */

  if (name === "train" ||
      name === "training") {
    const type =
      normalize(args[0]);

    if (!TRAINING[type]) {
      return message.reply(
        [
          "**Training Types**",
          "",
          "`,train shooting`",
          "`,train passing`",
          "`,train dribbling`",
          "`,train speed`",
          "`,train defense`",
          "`,train physical`",
          "`,train vision`"
        ].join("\n")
      );
    }

    const result =
      train(
        player,
        type
      );

    if (!result.success) {
      return message.reply(
        result.message
      );
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `🏋️ ${result.training.name} Training`
          )
          .setDescription(
            [
              `**${result.training.name}:** ${result.old} → ${result.newValue}`,
              `**Improvement:** +${result.increase}`,
              "",
              `⭐ OVR: ${result.oldOVR} → ${result.newOVR}`,
              `✨ XP: +${result.xp}`,
              `🔋 Stamina: ${player.stamina}/100`,
              result.levels
                ? `🎉 Level Up: +${result.levels}`
                : ""
            ]
              .filter(Boolean)
              .join("\n")
          )
      ]
    });
  }

  /* ATTRIBUTES */

  if (name === "attributes" ||
      name === "stats") {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📊 Player Attributes")
          .setDescription(
            [
              `**OVR:** ${player.rating}`,
              `**Shooting:** ${player.attributes.shooting}`,
              `**Passing:** ${player.attributes.passing}`,
              `**Dribbling:** ${player.attributes.dribbling}`,
              `**Speed:** ${player.attributes.speed}`,
              `**Defense:** ${player.attributes.defense}`,
              `**Physical:** ${player.attributes.physical}`,
              `**Vision:** ${player.attributes.vision}`,
              "",
              `🔋 **Stamina:** ${player.stamina}/100`
            ].join("\n")
          )
      ]
    });
  }

  /* REST */

  if (name === "rest") {
    player.stamina =
      clamp(
        player.stamina + 30,
        0,
        100
      );

    saveDB();

    return message.reply(
      `🔋 You rested. Stamina: **${player.stamina}/100**`
    );
  }

  /* INTEREST */

  if (name === "interest") {
    const list =
      Object.entries(
        player.clubInterest
      )
        .sort(
          ([_, a], [__, b]) =>
            b.score - a.score
        )
        .slice(0, 10);

    if (!list.length) {
      return message.reply(
        "No clubs are interested yet. Perform well in matches."
      );
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("👀 Club Interest")
          .setDescription(
            list
              .map(
                ([club, data]) =>
                  `• **${club}** — ${data.level}`
              )
              .join("\n")
          )
      ]
    });
  }

  /* OFFERS */

  if (name === "offers") {
    const offers =
      player.offers.filter(
        x => x.status === "pending"
      );

    if (!offers.length) {
      return message.reply(
        "You have no transfer offers."
      );
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📨 Transfer Offers")
          .setDescription(
            offers
              .map(
                offer =>
                  [
                    `**${offer.club}**`,
                    `ID: \`${offer.id}\``,
                    `Fee: ¥${money(offer.fee)}`,
                    `Salary: ¥${money(offer.salary)}`,
                    `Contract: ${offer.seasons} seasons`
                  ].join("\n")
              )
              .join("\n\n")
          )
      ]
    });
  }

  /* ACCEPT OFFER */

  if (name === "acceptoffer") {
    const id =
      args[0];

    const offer =
      player.offers.find(
        x =>
          x.id === id &&
          x.status === "pending"
      );

    if (!offer) {
      return message.reply(
        "Offer not found."
      );
    }

    const oldClub =
      player.club;

    player.club =
      offer.club;

    player.transferValue =
      Math.max(
        player.transferValue,
        offer.fee
      );

    offer.status =
      "accepted";

    saveDB();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ TRANSFER COMPLETED")
          .setDescription(
            [
              `**${oldClub}** → **${offer.club}**`,
              "",
              `Transfer Fee: ¥${money(offer.fee)}`,
              `Salary: ¥${money(offer.salary)}`,
              `Contract: ${offer.seasons} seasons`
            ].join("\n")
          )
      ]
    });
  }

  /* CLUB */

  if (name === "club") {
    const input =
      args.join(" ");

    const club =
      findClub(input);

    if (!club) {
      return message.reply(
        "Club not found."
      );
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🏟️ ${club}`)
          .setDescription(
            [
              `**Club OVR:** ${CLUBS[club]}`,
              "",
              `Your OVR: **${player.rating}**`,
              `Your Current Club: **${player.club}**`
            ].join("\n")
          )
      ]
    });
  }

  /* TRANSFER */

  if (name === "transfer") {
    const club =
      findClub(
        args.join(" ")
      );

    if (!club) {
      return message.reply(
        "Club not found."
      );
    }

    if (club === player.club) {
      return message.reply(
        "You're already at that club."
      );
    }

    const required =
      CLUBS[club] - 5;

    if (
      player.rating < required
    ) {
      return message.reply(
        [
          `**${club}** isn't ready to sign you.`,
          "",
          `Your OVR: **${player.rating}**`,
          `Required OVR: **${required}**`,
          "",
          "Keep training and performing well."
        ].join("\n")
      );
    }

    const old =
      player.club;

    player.club =
      club;

    player.transferValue +=
      rand(
        500000,
        5000000
      );

    saveDB();

    return message.reply(
      `🔄 Transfer completed: **${old} → ${club}**`
    );
  }

  /* COUNTRY */

  if (name === "setcountry") {
    const country =
      findCountry(
        args.join(" ")
      );

    if (!country) {
      return message.reply(
        "Country not found."
      );
    }

    player.country =
      country;

    saveDB();

    return message.reply(
      `🌍 Country set to **${country}**.`
    );
  }

  /* BALANCE */

  if (name === "balance") {
    return message.reply(
      `💰 Coins: **${money(player.coins)}**\n💎 Gems: **${money(player.gems)}**`
    );
  }

  /* CAREER */

  if (name === "career") {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📈 Career")
          .setDescription(
            [
              `**Level:** ${player.level}`,
              `**OVR:** ${player.rating}`,
              `**Career:** ${player.career}`,
              `**Club:** ${player.club}`,
              `**Country:** ${player.country}`,
              `**Transfer Value:** ¥${money(player.transferValue)}`,
              "",
              `**Matches:** ${player.stats.matches}`,
              `**Goals:** ${player.stats.goals}`,
              `**Assists:** ${player.stats.assists}`,
              `**Wins:** ${player.stats.wins}`,
              `**Losses:** ${player.stats.losses}`
            ].join("\n")
          )
      ]
    });
  }

  /* TROPHIES */

  if (name === "trophies") {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏆 Trophy Cabinet")
          .setDescription(
            player.trophies.length
              ? player.trophies
                  .map(
                    x => `🏆 **${x}**`
                  )
                  .join("\n")
              : "No trophies yet."
          )
      ]
    });
  }

  /* HELP */

  if (name === "help") {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚽ Blue Lock RPG")
          .setDescription(
            [
              "**PROFILE**",
              "`,profile`",
              "`,career`",
              "`,stats`",
              "`,attributes`",
              "`,balance`",
              "",
              "**PLAYERS**",
              "`,roll`",
              "`,players`",
              "`,character <name>`",
              "`,setplayer <name>`",
              "",
              "**MATCHES**",
              "`,match`",
              "`,rest`",
              "",
              "**TRAINING**",
              "`,train shooting`",
              "`,train passing`",
              "`,train dribbling`",
              "`,train speed`",
              "`,train defense`",
              "`,train physical`",
              "`,train vision`",
              "",
              "**CAREER**",
              "`,interest`",
              "`,offers`",
              "`,acceptoffer <id>`",
              "`,transfer <club>`",
              "`,setcountry <country>`",
              "",
              "**SEASON**",
              "`,trophies`"
            ].join("\n")
          )
      ]
    });
  }

  /* OWNER */

  if (name === "rob") {
    if (
      message.author.id !==
      OWNER_ID
    ) {
      return message.reply(
        "Not authorized."
      );
    }

    player.coins +=
      1000000000;

    player.gems +=
      100000;

    player.rating = 99;
    player.level = 100;

    saveDB();

    return message.reply(
      "👑 Owner rewards activated."
    );
  }

  if (name === "givechar") {
    if (
      message.author.id !==
      OWNER_ID
    ) {
      return message.reply(
        "Not authorized."
      );
    }

    const target =
      message.mentions.users.first();

    if (!target) {
      return message.reply(
        "Mention a player."
      );
    }

    const id =
      findPlayer(
        args.slice(1).join(" ")
      );

    if (!id) {
      return message.reply(
        "Player not found."
      );
    }

    const targetData =
      getUser(target.id);

    if (
      !targetData.players.includes(id)
    ) {
      targetData.players.push(id);
    }

    saveDB();

    return message.reply(
      `Gave **${PLAYERS[id].name}** to ${target}.`
    );
  }

  if (name === "givecoins") {
    if (
      message.author.id !==
      OWNER_ID
    ) {
      return message.reply(
        "Not authorized."
      );
    }

    const target =
      message.mentions.users.first();

    const amount =
      Number(
        args[1]
      );

    if (
      !target ||
      !Number.isFinite(amount)
    ) {
      return message.reply(
        "Use `,givecoins @user amount`."
      );
    }

    getUser(
      target.id
    ).coins += amount;

    saveDB();

    return message.reply(
      `Gave **${money(amount)} coins** to ${target}.`
    );
  }

  if (name === "givegems") {
    if (
      message.author.id !==
      OWNER_ID
    ) {
      return message.reply(
        "Not authorized."
      );
    }

    const target =
      message.mentions.users.first();

    const amount =
      Number(
        args[1]
      );

    if (
      !target ||
      !Number.isFinite(amount)
    ) {
      return message.reply(
        "Use `,givegems @user amount`."
      );
    }

    getUser(
      target.id
    ).gems += amount;

    saveDB();

    return message.reply(
      `Gave **${money(amount)} gems** to ${target}.`
    );
  }
}

/* =========================================================
   PREFIX
========================================================= */

client.on(
  "messageCreate",
  async message => {
    if (message.author.bot) return;

    if (
      !message.content.startsWith(PREFIX)
    ) {
      return;
    }

    const content =
      message.content
        .slice(PREFIX.length)
        .trim();

    if (!content) return;

    const parts =
      content.split(/\s+/);

    const name =
      parts.shift().toLowerCase();

    try {
      await command(
        name,
        parts,
        message
      );
    } catch (error) {
      console.error(error);

      await message.reply(
        "Something went wrong."
      ).catch(() => {});
    }
  }
);

/* =========================================================
   SLASH COMMANDS
========================================================= */

const slashCommands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your career"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll for a player"),

  new SlashCommandBuilder()
    .setName("players")
    .setDescription("View your players"),

  new SlashCommandBuilder()
    .setName("character")
    .setDescription("View a player")
    .addStringOption(o =>
      o
        .setName("name")
        .setDescription("Player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setplayer")
    .setDescription("Equip a player")
    .addStringOption(o =>
      o
        .setName("name")
        .setDescription("Player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Play an interactive match"),

  new SlashCommandBuilder()
    .setName("train")
    .setDescription("Train an attribute")
    .addStringOption(o =>
      o
        .setName("type")
        .setDescription("Training type")
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
    .setName("attributes")
    .setDescription("View attributes"),

  new SlashCommandBuilder()
    .setName("rest")
    .setDescription("Recover stamina"),

  new SlashCommandBuilder()
    .setName("interest")
    .setDescription("View club interest"),

  new SlashCommandBuilder()
    .setName("offers")
    .setDescription("View transfer offers"),

  new SlashCommandBuilder()
    .setName("acceptoffer")
    .setDescription("Accept transfer offer")
    .addStringOption(o =>
      o
        .setName("id")
        .setDescription("Offer ID")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer to a club")
    .addStringOption(o =>
      o
        .setName("club")
        .setDescription("Club")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setcountry")
    .setDescription("Set country")
    .addStringOption(o =>
      o
        .setName("country")
        .setDescription("Country")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("career")
    .setDescription("View career"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View statistics"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View balance"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("View trophies"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View commands")
].map(x => x.toJSON());

/* =========================================================
   SLASH HANDLER
========================================================= */

client.on(
  "interactionCreate",
  async interaction => {
    if (
      !interaction.isChatInputCommand()
    ) {
      return;
    }

    const player =
      getUser(
        interaction.user.id
      );

    try {
      const name =
        interaction.commandName;

      if (name === "train") {
        const type =
          interaction.options.getString(
            "type"
          );

        const result =
          train(
            player,
            type
          );

        if (!result.success) {
          return interaction.reply(
            result.message
          );
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `🏋️ ${result.training.name}`
              )
              .setDescription(
                [
                  `${result.old} → ${result.newValue}`,
                  `**+${result.increase} attribute**`,
                  "",
                  `OVR: ${result.oldOVR} → ${result.newOVR}`,
                  `XP: +${result.xp}`,
                  `Stamina: ${player.stamina}/100`
                ].join("\n")
              )
          ]
        });
      }

      if (name === "character") {
        const id =
          findPlayer(
            interaction.options.getString(
              "name"
            )
          );

        if (!id) {
          return interaction.reply(
            "Player not found."
          );
        }

        const p =
          PLAYERS[id];

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(p.name)
              .setDescription(
                [
                  `OVR: **${p.rating}**`,
                  `Rarity: **${p.rarity}**`,
                  `Position: **${p.position}**`,
                  `Country: **${p.country}**`,
                  `Club: **${p.club}**`,
                  "",
                  p.skills
                    .map(
                      (x, i) =>
                        `${i + 1}. ${x}`
                    )
                    .join("\n")
                ].join("\n")
              )
          ]
        });
      }

      if (
        name === "setplayer"
      ) {
        const id =
          findPlayer(
            interaction.options.getString(
              "name"
            )
          );

        if (!id) {
          return interaction.reply(
            "Player not found."
          );
        }

        if (
          !player.players.includes(id)
        ) {
          return interaction.reply(
            "You don't own that player."
          );
        }

        player.activePlayer = id;
        player.position =
          PLAYERS[id].position;

        saveDB();

        return interaction.reply(
          `Equipped **${PLAYERS[id].name}**.`
        );
      }

      if (
        name === "transfer"
      ) {
        const club =
          findClub(
            interaction.options.getString(
              "club"
            )
          );

        if (!club) {
          return interaction.reply(
            "Club not found."
          );
        }

        player.club = club;

        saveDB();

        return interaction.reply(
          `Transferred to **${club}**.`
        );
      }

      if (
        name === "setcountry"
      ) {
        const country =
          findCountry(
            interaction.options.getString(
              "country"
            )
          );

        if (!country) {
          return interaction.reply(
            "Country not found."
          );
        }

        player.country =
          country;

        saveDB();

        return interaction.reply(
          `Country set to **${country}**.`
        );
      }

      if (
        name === "acceptoffer"
      ) {
        const id =
          interaction.options.getString(
            "id"
          );

        const offer =
          player.offers.find(
            x =>
              x.id === id &&
              x.status === "pending"
          );

        if (!offer) {
          return interaction.reply(
            "Offer not found."
          );
        }

        player.club =
          offer.club;

        offer.status =
          "accepted";

        saveDB();

        return interaction.reply(
          `✅ You joined **${offer.club}**.`
        );
      }

      if (
        name === "profile" ||
        name === "career" ||
        name === "stats" ||
        name === "balance" ||
        name === "attributes" ||
        name === "trophies" ||
        name === "players" ||
        name === "interest" ||
        name === "offers" ||
        name === "help"
      ) {
        return interaction.reply(
          `Use the prefix version: \`,${name}\``
        );
      }

      if (name === "roll") {
        const entries =
          Object.entries(
            PLAYERS
          );

        const [
          id,
          rolled
        ] =
          entries[
            rand(
              0,
              entries.length - 1
            )
          ];

        if (
          !player.players.includes(id)
        ) {
          player.players.push(id);
        } else {
          player.coins += 1000;
        }

        saveDB();

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `🎰 ${rolled.name}`
              )
              .setDescription(
                [
                  `**${rolled.rarity}**`,
                  `**${rolled.rating} OVR**`,
                  "",
                  rolled.skills
                    .map(
                      x => `• ${x}`
                    )
                    .join("\n")
                ].join("\n")
              )
          ]
        });
      }

      if (name === "rest") {
        player.stamina =
          clamp(
            player.stamina + 30,
            0,
            100
          );

        saveDB();

        return interaction.reply(
          `🔋 Stamina: **${player.stamina}/100**`
        );
      }

      if (name === "match") {
        /*
          Slash matches need a message-like
          interface, so this uses a temporary
          button interaction.
        */

        if (
          !getActivePlayer(player)
        ) {
          return interaction.reply(
            "Equip a player first with `/setplayer`."
          );
        }

        if (
          player.stamina < 30
        ) {
          return interaction.reply(
            "You need at least 30 stamina."
          );
        }

        player.stamina -= 30;

        const clubs =
          Object.keys(CLUBS);

        const opponent =
          clubs[
            rand(
              0,
              clubs.length - 1
            )
          ];

        let goals = 0;
        let assists = 0;
        let oppGoals = rand(0, 3);
        let chances = 0;

        const active =
          getActivePlayer(player);

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `⚽ ${player.club} vs ${opponent}`
              )
              .setDescription(
                [
                  `Player: **${active.name}**`,
                  "",
                  `**0 - ${oppGoals}**`,
                  "",
                  "🔥 **CHANCE!**",
                  "Choose an action."
                ].join("\n")
              )
          ],
          components: [
            matchButtonRow(player)
          ]
        });

        const msg =
          await interaction.fetchReply();

        const collector =
          msg.createMessageComponentCollector({
            componentType:
              ComponentType.Button,
            time: 60000
          });

        collector.on(
          "collect",
          async btn => {
            if (
              btn.user.id !==
              interaction.user.id
            ) {
              return btn.reply({
                content:
                  "This isn't your match.",
                ephemeral: true
              });
            }

            chances++;

            const result =
              performAction(
                player,
                btn.customId,
                {},
                CLUBS[opponent]
              );

            player.stamina =
              clamp(
                player.stamina -
                  (btn.customId === "skill"
                    ? 10
                    : 5),
                0,
                100
              );

            if (result.goal) goals++;
            if (result.assist) assists++;

            if (
              chances >= 3
            ) {
              collector.stop();
            }

            await btn.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle(
                    "⚽ Match Chance"
                  )
                  .setDescription(
                    [
                      result.success
                        ? `**${btn.customId.toUpperCase()} SUCCESS**`
                        : `**${btn.customId.toUpperCase()} FAILED**`,
                      "",
                      result.goal
                        ? "⚽ GOAL!"
                        : result.assist
                          ? "🅰️ ASSIST!"
                          : "No direct contribution.",
                      "",
                      `Score: **${goals} - ${oppGoals}**`,
                      `Stamina: **${player.stamina}/100**`,
                      `Chance: **${chances}/3**`
                    ].join("\n")
                  )
              ],
              components:
                chances >= 3
                  ? []
                  : [matchButtonRow(player)]
            });
          }
        );

        collector.on(
          "end",
          async () => {
            const final =
              finishMatch(
                player,
                CLUBS[opponent],
                goals,
                assists,
                oppGoals
              );

            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(
                    "🏁 MATCH FINISHED"
                  )
                  .setDescription(
                    [
                      `**${player.club} ${goals} - ${oppGoals} ${opponent}**`,
                      "",
                      final.result === "win"
                        ? "🏆 **VICTORY**"
                        : final.result === "draw"
                          ? "🤝 **DRAW**"
                          : "❌ **DEFEAT**",
                      "",
                      `⚽ Goals: **${goals}**`,
                      `🅰️ Assists: **${assists}**`,
                      `⭐ Rating: **${final.rating}**`,
                      "",
                      `OVR: **${final.oldOVR} → ${final.newOVR}**`,
                      `Improvement: **${final.improvement >= 0 ? "+" : ""}${final.improvement}**`,
                      `XP: **+${final.xp}**`,
                      `Coins: **+${money(final.coins)}**`,
                      "",
                      final.interest.length
                        ? "**👀 Club Interest**\n" +
                          final.interest
                            .map(
                              x =>
                                `• ${x.club} — ${x.level}`
                            )
                            .join("\n")
                        : "No new club interest."
                    ].join("\n")
                  )
              ],
              components: []
            }).catch(() => {});
          }
        );

        return;
      }
    } catch (error) {
      console.error(error);

      if (!interaction.replied) {
        await interaction.reply(
          "Something went wrong."
        ).catch(() => {});
      }
    }
  }
);

/* =========================================================
   READY
========================================================= */

client.once(
  "clientReady",
  async ready => {
    console.log(
      `Logged in as ${ready.user.tag}`
    );

    console.log(
      `Players loaded: ${Object.keys(PLAYERS).length}`
    );

    console.log(
      `Season: ${db.season}`
    );

    try {
      if (GUILD_ID) {
        const guild =
          await ready.guilds.fetch(
            GUILD_ID
          );

        await guild.commands.set(
          slashCommands
        );
      } else {
        await ready.application.commands.set(
          slashCommands
        );
      }

      console.log(
        "Slash commands registered."
      );
    } catch (error) {
      console.error(
        "Slash registration error:",
        error
      );
    }

    console.log(
      "Blue Lock RPG ONLINE."
    );
  }
);

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN).catch(
  console.error
);

process.on(
  "unhandledRejection",
  console.error
);

process.on(
  "uncaughtException",
  console.error
);
