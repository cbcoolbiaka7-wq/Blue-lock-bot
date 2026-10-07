const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const PREFIX = ",";
const OWNER_ID = "1547542814525493269";

if (!TOKEN) throw new Error("Missing DISCORD_TOKEN");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* =========================
   DATABASE
========================= */

const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "database.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}");

let db;

try {
  db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
} catch {
  db = {};
}

let saveTimer = null;

function saveNow() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  try {
    const tmp = dbFile + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, dbFile);
  } catch (err) {
    console.error("Save error:", err);
  }
}

// Saves a moment later instead of blocking every button click.
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(saveNow, 300);
}

process.on("SIGTERM", () => { saveNow(); process.exit(0); });
process.on("SIGINT", () => { saveNow(); process.exit(0); });
process.on("unhandledRejection", err => console.error("Unhandled rejection:", err));
process.on("uncaughtException", err => console.error("Uncaught exception:", err));

/*
  Safe reply: never throws and always picks reply / followUp correctly.
  This is what stops "This interaction failed" when something goes wrong.
*/
async function safeRespond(interaction, payload) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ ...payload, flags: 64 });
    } else {
      await interaction.reply({ ...payload, flags: 64 });
    }
  } catch (err) {
    console.error("safeRespond failed:", err.message);
  }
}

/* =========================
   CHARACTERS
========================= */

const CHARACTERS = [
  ["Yoichi Isagi", 95, "ST", "Japan", "Bastard München", ["Meta Vision", "Direct Shot", "Two-Gun Volley"]],
  ["Michael Kaiser", 98, "ST", "Germany", "Bastard München", ["Kaiser Impact", "Kaiser Impact Magnus", "Emperor's Eye"]],
  ["Noel Noa", 100, "ST", "France", "Bastard München", ["World Class", "Perfect Shooting", "Meta Vision"]],
  ["Alexis Ness", 91, "CM", "Germany", "Bastard München", ["Magic Pass", "Kaiser Assist", "Creative Vision"]],
  ["Rensuke Kunigami", 88, "ST", "Japan", "Bastard München", ["Power Shot", "Ambidextrous", "Hero Mode"]],
  ["Meguru Bachira", 94, "RW", "Japan", "FC Barcha", ["Monster", "Elastico", "Dribble Genius"]],
  ["Lavinho", 99, "LW", "Brazil", "FC Barcha", ["Brazilian Dance", "Creative Dribble", "Magician"]],
  ["Seishiro Nagi", 96, "ST", "Japan", "Manshine City", ["Perfect Trap", "Five Shot Revolver", "Fake Volley"]],
  ["Reo Mikage", 92, "CM", "Japan", "Manshine City", ["Chameleon", "Copy", "Adaptation"]],
  ["Hyoma Chigiri", 91, "LW", "Japan", "Manshine City", ["Speed", "44 Panther Snipe", "Long Sprint"]],
  ["Shoei Barou", 96, "ST", "Japan", "Ubers", ["Predator Eye", "King's Shot", "Charging King"]],
  ["Oliver Aiku", 91, "CB", "Japan", "Ubers", ["Defensive Vision", "Read", "Aerial Control"]],
  ["Don Lorenzo", 96, "CB", "Italy", "Ubers", ["Zombie Dribble", "Man Marking", "Ace Eater"]],
  ["Marc Snuffy", 99, "ST", "Italy", "Ubers", ["Tactical Master", "Perfect Position", "Master Vision"]],
  ["Rin Itoshi", 98, "ST", "Japan", "Paris X Gen", ["Destroyer", "Puppet Control", "Flow Shot"]],
  ["Ryusei Shidou", 97, "ST", "Japan", "Paris X Gen", ["Dragon Drive", "Big Bang Drive", "Spatial Awareness"]],
  ["Charles Chevalier", 92, "CM", "France", "Paris X Gen", ["Killer Pass", "Vision", "Thread Pass"]],
  ["Julian Loki", 99, "ST", "France", "Paris X Gen", ["Godspeed", "Acceleration", "Lightning Shot"]],
  ["Kenyu Yukimiya", 89, "LW", "Japan", "Bastard München", ["Gyro Shot", "1v1", "Cut Inside"]],
  ["Tabito Karasu", 90, "CM", "Japan", "Paris X Gen", ["Ball Keeping", "Analyst", "Feint"]],
  ["Eita Otoya", 87, "RW", "Japan", "FC Barcha", ["Stealth", "Off Ball", "Quick Finish"]],
  ["Ikki Niko", 86, "CB", "Japan", "Ubers", ["Eye", "Interception", "Defensive Vision"]],
  ["Gin Gagamaru", 88, "GK", "Japan", "Bastard München", ["Super Save", "Reflex", "Acrobatic Save"]],
  ["Yo Hiori", 90, "CM", "Japan", "Bastard München", ["Perfect Pass", "Vision", "Outside Foot"]],
  ["Jyubei Aryu", 85, "CB", "Japan", "Ubers", ["Height", "Aerial", "Long Reach"]],
  ["Zantetsu Tsurugi", 82, "RW", "Japan", "Manshine City", ["Explosive Speed", "Acceleration", "Power Run"]],
  ["Agi", 89, "ST", "England", "Manshine City", ["Technical Shot", "Physicality", "Control"]],
  ["Kaiser NEL", 99, "ST", "Germany", "Bastard München", ["Kaiser Impact", "Emperor's Eye", "Magnus"]],
  ["Isagi NEL", 97, "ST", "Japan", "Bastard München", ["Meta Vision", "Two-Gun Volley", "Adaptation"]],
  ["Rin NEL", 99, "ST", "Japan", "Paris X Gen", ["Destroyer", "Flow Shot", "Puppet Control"]],
  ["Shidou NEL", 98, "ST", "Japan", "Paris X Gen", ["Big Bang Drive", "Dragon Drive", "Instinct"]],
  ["Barou NEL", 97, "ST", "Japan", "Ubers", ["Predator Eye", "King's Shot", "Villain"]],
  ["Nagi NEL", 97, "ST", "Japan", "Manshine City", ["Perfect Trap", "Revolver", "Trap Shot"]],
  ["Bachira NEL", 95, "RW", "Japan", "FC Barcha", ["Monster", "Elastic Dribble", "Solo Run"]],
  ["Chigiri NEL", 93, "LW", "Japan", "Manshine City", ["Speed", "Panther Snipe", "Sprint"]],
  ["Kunigami NEL", 91, "ST", "Japan", "Bastard München", ["Power Shot", "Ambidextrous", "Hero Mode"]],
  ["Ness NEL", 93, "CM", "Germany", "Bastard München", ["Magic Pass", "Kaiser Assist", "Vision"]],
  ["Lorenzo NEL", 97, "CB", "Italy", "Ubers", ["Man Marking", "Zombie Dribble", "Ace Eater"]],
  ["Snuffy NEL", 100, "ST", "Italy", "Ubers", ["Master Vision", "Tactics", "Perfect Position"]],
  ["Loki NEL", 100, "ST", "France", "Paris X Gen", ["Godspeed", "Lightning", "Acceleration"]],
  ["Lavinho NEL", 100, "LW", "Brazil", "FC Barcha", ["Magician", "Brazilian Dance", "Creative Dribble"]],

  // ----- More Blue Lock characters (ratings are estimates) -----
  ["Sae Itoshi", 99, "CM", "Japan", "Re Al", ["Master Pass", "World's Vision", "Absolute Control"]],
  ["Leonardo Luna", 98, "CM", "Spain", "Re Al", ["Royal Vision", "Scion Pass", "Crown Control"]],
  ["Chris Prince", 99, "ST", "England", "Manshine City", ["Master Strike", "Power Surge", "Prince's Shot"]],
  ["Benedict Grim", 90, "CM", "Germany", "Bastard München", ["Playmaker Vision", "Smart Pass", "Build-Up Play"]],
  ["Ignacio Lara", 88, "ST", "Spain", "FC Barcha", ["Barcha Flair", "Sharp Dribble", "Link Pass"]],
  ["Jingo Raichi", 84, "ST", "Japan", "Bastard München", ["Shark Bite", "Iron Stamina", "Fierce Press"]],
  ["Jin Kiyora", 87, "ST", "Japan", "Bastard München", ["Silent Finish", "Cool Head", "Precise Shot"]],
  ["Ranze Kurona", 86, "LW", "Japan", "Bastard München", ["Wild Instinct", "Predator Run", "Sharp Dribble"]],
  ["Gurimu Igarashi", 75, "ST", "Japan", "Bastard München", ["Persistence", "Hard Foul", "Never Give Up"]],
  ["Teppei Neru", 76, "ST", "Japan", "Bastard München", ["Reserve Spark", "Hustle", "Quick Shot"]],
  ["Mensah", 82, "CB", "Germany", "Bastard München", ["Team Play", "Strong Tackle", "Hustle"]],
  ["Bachman", 80, "GK", "Germany", "Bastard München", ["Team Play", "Quick Reflex", "Hustle"]],
  ["Ndiaye", 80, "CB", "Germany", "Bastard München", ["Team Play", "Strong Tackle", "Hustle"]],
  ["Nijiro Nanase", 82, "ST", "Japan", "Paris X Gen", ["Sharp Cut", "Lightning Touch", "Fast Break"]],
  ["Aoshi Tokimitsu", 80, "ST", "Japan", "Paris X Gen", ["Hustle", "Heavy Block", "Quick Shot"]],
  ["Debussy", 82, "CM", "France", "Paris X Gen", ["Team Play", "Quick Pass", "Hustle"]],
  ["Poussin", 80, "CM", "France", "Paris X Gen", ["Team Play", "Quick Pass", "Hustle"]],
  ["Ohana", 80, "ST", "France", "Paris X Gen", ["Team Play", "Quick Shot", "Hustle"]],
  ["Domenech", 81, "CB", "France", "Paris X Gen", ["Team Play", "Strong Tackle", "Hustle"]],
  ["Cousin", 80, "LW", "France", "Paris X Gen", ["Team Play", "Quick Step", "Hustle"]],
  ["Cucuron", 79, "RW", "France", "Paris X Gen", ["Team Play", "Quick Step", "Hustle"]],
  ["Shuto Sendo", 84, "CM", "Japan", "Ubers", ["Hot Blood", "Fierce Dribble", "Rapid Burst"]],
  ["Junichi Wanima", 80, "ST", "Japan", "Manshine City", ["Top Scorer Instinct", "Twin Link", "Power Volley"]],
  ["Young", 79, "CM", "England", "Manshine City", ["Team Play", "Quick Pass", "Hustle"]],
  ["Arthur", 80, "CB", "England", "Manshine City", ["Team Play", "Strong Tackle", "Hustle"]],
  ["Damon", 79, "ST", "England", "Manshine City", ["Team Play", "Quick Shot", "Hustle"]],
  ["Wataru Kuon", 74, "ST", "Japan", "Blue Lock", ["Leadership", "Team Tactics", "Defensive Anchor"]],
  ["Yudai Imamura", 70, "RW", "Japan", "Blue Lock", ["Quick Feet", "Speed Rush", "Flashy Trick"]],
  ["Asahi Naruhaya", 76, "LW", "Japan", "Blue Lock", ["Fast Footwork", "Quick Step", "Close Dribble"]],
  ["Okuhito Iemon", 70, "GK", "Japan", "Blue Lock", ["Keeper Reflex", "Goalkeeping", "Distribution"]],
  ["Ryosuke Kira", 80, "ST", "Japan", "Blue Lock", ["Crown Shot", "Technical Finish", "Calm Finish"]],
  ["Keisuke Wanima", 72, "ST", "Japan", "Blue Lock", ["Twin Link", "Side-B Drive", "Quick Strike"]],
  ["Reiji Hiiragi", 74, "ST", "Japan", "Blue Lock", ["Persistence", "Quick Feet", "Hustle"]]
];

const characters = Object.fromEntries(
  CHARACTERS.map(c => [
    c[0].toLowerCase(),
    {
      name: c[0],
      rating: c[1],
      position: c[2],
      country: c[3],
      club: c[4],
      skills: c[5]
    }
  ])
);

/* =========================
   FLOWS
========================= */

const FLOWS = {
  "meta vision": {
    name: "Meta Vision",
    abilities: ["Predicted Play", "Spatial Reading", "Vision Shot"]
  },
  "emperor": {
    name: "Emperor",
    abilities: ["Emperor's Eye", "Kaiser Impact", "Kaiser Impact Magnus"]
  },
  "destroyer": {
    name: "Destroyer",
    abilities: ["Predator Instinct", "Destroyer Shot", "Pressure Break"]
  },
  "godspeed": {
    name: "Godspeed",
    abilities: ["Lightning Run", "Acceleration", "Godspeed Finish"]
  },
  "monster": {
    name: "Monster",
    abilities: ["Monster Dribble", "Instinct", "Monster Finish"]
  },
  "king": {
    name: "King",
    abilities: ["King's Shot", "Predator Eye", "Charging King"]
  },
  "street": {
    name: "Street",
    abilities: ["Street Dribble", "Fake Out", "Street Finish"]
  },
  "playmaker": {
    name: "Playmaker",
    abilities: ["Thread Pass", "Vision", "Perfect Assist"]
  },
  "guardian": {
    name: "Guardian",
    abilities: ["Lockdown", "Interception", "Defensive Wall"]
  },
  "master": {
    name: "Master",
    abilities: ["Perfect Control", "Tactical Vision", "Master Finish"]
  }
};

/* =========================
   ALIASES
========================= */

const aliases = {
  "kaiser": "Michael Kaiser",
  "micheal kaiser": "Michael Kaiser",
  "michael": "Michael Kaiser",
  "isagi": "Yoichi Isagi",
  "yoichi": "Yoichi Isagi",
  "rin": "Rin Itoshi",
  "shidou": "Ryusei Shidou",
  "shidou ryusei": "Ryusei Shidou",
  "barou": "Shoei Barou",
  "nagi": "Seishiro Nagi",
  "bachira": "Meguru Bachira",
  "chigiri": "Hyoma Chigiri",
  "loki": "Julian Loki",
  "noa": "Noel Noa",
  "lavinho": "Lavinho",
  "snuffy": "Marc Snuffy",
  "lorenzo": "Don Lorenzo"
};

function normalize(s) {
  return String(s).toLowerCase().trim();
}

function clean(s) {
  return normalize(s)
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return dp[a.length][b.length];
}

/*
  Smart matcher: works with partial names, first/last names,
  typos ("micheal", "kaizer", "bachria") and different casing.
  `list` = array of { name, ... } objects. Earlier items win ties.
*/
function smartFind(input, list, fuzzy = true) {
  const q = clean(input);
  if (!q) return null;

  const names = list.map(item => ({ item, n: clean(item.name) }));

  // 1. exact
  let hit = names.find(x => x.n === q);
  if (hit) return hit.item;

  // 2. any word starts with it ("kaiser", "isa", "ness", "rin")
  hit = names.find(x => x.n.split(" ").some(w => w.startsWith(q)));
  if (hit) return hit.item;

  // 3. whole name starts with it ("michael k")
  hit = names.find(x => x.n.startsWith(q));
  if (hit) return hit.item;

  // 4. contains it / it contains the name
  hit = names.find(x => x.n.includes(q) || q.includes(x.n));
  if (hit) return hit.item;

  // 5. typo tolerance
  if (!fuzzy) return null;

  let best = null;
  let bestDist = Infinity;

  for (const x of names) {
    const candidates = [x.n, ...x.n.split(" ")];

    for (const c of candidates) {
      const d = levenshtein(q, c);
      if (d < bestDist) {
        bestDist = d;
        best = x.item;
      }
    }
  }

  const limit = Math.max(1, Math.floor(q.length / 3));
  return bestDist <= limit ? best : null;
}

function findCharacter(input, fuzzy = true) {
  const q = clean(input);
  if (!q) return null;

  if (aliases[q]) return characters[aliases[q].toLowerCase()];

  return smartFind(input, Object.values(characters), fuzzy);
}

/*
  Which Flow belongs to which character.
  Edit this list however you want. "NEL" versions
  automatically use the same Flow as the normal one.
*/
const CHARACTER_FLOWS = {
  "michael kaiser": "Emperor",
  "yoichi isagi": "Meta Vision",
  "rin itoshi": "Destroyer",
  "julian loki": "Godspeed",
  "hyoma chigiri": "Godspeed",
  "meguru bachira": "Monster",
  "shoei barou": "King",
  "ryusei shidou": "Street",
  "lavinho": "Street",
  "alexis ness": "Playmaker",
  "charles chevalier": "Playmaker",
  "yo hiori": "Playmaker",
  "reo mikage": "Playmaker",
  "don lorenzo": "Guardian",
  "oliver aiku": "Guardian",
  "ikki niko": "Guardian",
  "marc snuffy": "Master",
  "noel noa": "Master",
  "seishiro nagi": "Master"
};

function flowOfCharacter(c) {
  if (!c) return null;

  let key = normalize(c.name);

  // "Kaiser NEL" -> use the normal "Michael Kaiser" Flow
  if (key.endsWith(" nel")) {
    const base = findCharacter(key.replace(/ nel$/, ""), false);
    if (base && !normalize(base.name).endsWith(" nel")) {
      key = normalize(base.name);
    }
  }

  const flowName = CHARACTER_FLOWS[key];

  return flowName ? FLOWS[normalize(flowName)] : null;
}

/*
  Accepts a Flow name ("emperor", "meta") OR a character
  name ("kaiser", "isagi", "rin") and returns the Flow.
*/
function findFlow(input) {
  if (!clean(input)) return null;

  // 1. Flow name, exact / partial (no typo guessing yet)
  const byName = smartFind(input, Object.values(FLOWS), false);
  if (byName) return byName;

  // 2. Character name, exact / partial
  const byChar = flowOfCharacter(findCharacter(input, false));
  if (byChar) return byChar;

  // 3. Typos: Flow first, then character
  return (
    smartFind(input, Object.values(FLOWS), true) ||
    flowOfCharacter(findCharacter(input, true))
  );
}

/* =========================
   SKILLS (5+ PER CHARACTER)
========================= */

/*
  Extra skills added on top of each character's original ones.
  "NEL" versions automatically get the same extras as the normal one.
*/
const EXTRA_SKILLS = {
  "yoichi isagi": ["Chemical Reaction", "Ego Awakening", "Goal Instinct"],
  "michael kaiser": ["Kaiser Impact Rush", "Royal Dribble", "Emperor's Command"],
  "noel noa": ["Absolute Control", "Long Range Strike", "Total Football"],
  "alexis ness": ["Through Ball", "Kaiser's Shadow", "Precision Cross"],
  "rensuke kunigami": ["Heavy Shot", "Wild Charge", "Hero's Volley"],
  "meguru bachira": ["Monster Dribble", "Monster Shot", "Wild Feint"],
  "lavinho": ["Samba Step", "Rainbow Flick", "Nutmeg Magic"],
  "seishiro nagi": ["Heel Trap", "Lazy Volley", "Genius Touch"],
  "reo mikage": ["Mirror Play", "Pass Copy", "Supporting Run"],
  "hyoma chigiri": ["Sprint Burst", "Overlap Run", "Speed Cross"],
  "shoei barou": ["Territory Shot", "Ego Blast", "Alpha Press"],
  "oliver aiku": ["Last Man Tackle", "Slide Block", "Header Clear"],
  "don lorenzo": ["Shadow Mark", "Hard Tackle", "Wall Defense"],
  "marc snuffy": ["Perfect Timing", "Quick Finish", "Space Control"],
  "rin itoshi": ["Ice Dribble", "Perfect Cross", "Cold Finish"],
  "ryusei shidou": ["Wild Dragon", "Instinct Dribble", "Dragon Header"],
  "charles chevalier": ["Royal Pass", "Counter Pass", "Swift Lob"],
  "julian loki": ["Blitz Dash", "Thunder Strike", "Trick Step"],
  "kenyu yukimiya": ["Snow Drive", "Wing Run", "Back Post Header"],
  "tabito karasu": ["Quick Turn", "Dummy Pass", "Press Resist"],
  "eita otoya": ["Hidden Run", "Cut Back", "Sneak Shot"],
  "ikki niko": ["Zone Cover", "Block Shot", "Clean Tackle"],
  "gin gagamaru": ["Diving Save", "Penalty Stop", "Goal Kick Pass"],
  "yo hiori": ["Curved Pass", "Midfield Control", "Set Piece Genius"],
  "jyubei aryu": ["Tall Wall", "Header Clear", "Air Duel"],
  "zantetsu tsurugi": ["Rush Dribble", "Power Cross", "Flash Step"],
  "agi": ["Body Shield", "Long Shot", "Close Control"]
};

// Safety net so every character always ends up with 5+ skills.
const POSITION_SKILLS = {
  ST: ["Clinical Finish", "Poacher Instinct", "Far Post Strike", "Power Header", "Quick Shot"],
  LW: ["Wing Run", "Cut Inside", "Speed Dribble", "Curved Shot", "Cross"],
  RW: ["Wing Run", "Cut Inside", "Speed Dribble", "Curved Shot", "Cross"],
  CM: ["Through Pass", "Midfield Control", "Long Pass", "Press Resist", "Set Piece"],
  CB: ["Hard Tackle", "Aerial Duel", "Interception", "Block Shot", "Clear Ball"],
  GK: ["Diving Save", "Reflex Save", "Penalty Stop", "Goal Kick Pass", "Sweeper Rush"]
};

function buildFullSkills() {
  for (const c of Object.values(characters)) {
    let baseName = normalize(c.name);

    if (baseName.endsWith(" nel")) {
      const base = findCharacter(baseName.replace(/ nel$/, ""), false);

      if (base && !normalize(base.name).endsWith(" nel")) {
        baseName = normalize(base.name);
      }
    }

    const merged = [
      ...new Set([...c.skills, ...(EXTRA_SKILLS[baseName] || [])])
    ];

    const pool = POSITION_SKILLS[c.position] || POSITION_SKILLS.ST;

    for (const s of pool) {
      if (merged.length >= 5) break;
      if (!merged.includes(s)) merged.push(s);
    }

    c.skills = merged;
  }
}

buildFullSkills();

/* =========================
   INFO EMBEDS
========================= */

function flowUsers(flow) {
  return Object.entries(CHARACTER_FLOWS)
    .filter(([, f]) => f === flow.name)
    .map(([key]) => characters[key]?.name || key);
}

function flowInfoEmbed(flow) {
  const users = flowUsers(flow);

  return new EmbedBuilder()
    .setTitle(`🔥 ${flow.name} Flow`)
    .addFields(
      {
        name: "Skills",
        value: flow.abilities.map((x, i) => `${i + 1}. ${x}`).join("\n")
      },
      {
        name: "Used by",
        value: users.length ? users.join(", ") : "—"
      }
    );
}

function allFlowsEmbed() {
  const list = Object.values(FLOWS);

  return new EmbedBuilder()
    .setTitle(`🔥 Flow Info — ${list.length} Flows`)
    .setDescription(
      `There are **${list.length}** Flows. ` +
      `Use \`/flow info <name>\` for details on one.`
    )
    .addFields(
      list.map(f => ({
        name: `🔥 ${f.name}`,
        value: f.abilities.map(x => `• ${x}`).join("\n"),
        inline: true
      }))
    );
}

function characterInfoEmbed(c) {
  const flow = flowOfCharacter(c);

  return new EmbedBuilder()
    .setTitle(`⚽ ${c.name}`)
    .setDescription(
      `⭐ Rating: **${c.rating}**\n` +
      `📍 Position: **${c.position}**\n` +
      `🌍 Country: **${c.country}**\n` +
      `🏟️ Club: **${c.club}**\n` +
      `🔥 Flow: **${flow ? flow.name : "None"}**`
    )
    .addFields({
      name: "Skills",
      value: c.skills.map(x => `• ${x}`).join("\n")
    });
}

/* =========================
   PLAYER DATA
========================= */

function getPlayer(id) {
  if (!db[id]) {
    db[id] = {
      coins: 10000,
      gems: 100,
      level: 1,
      xp: 0,
      rating: 60,
      position: "ST",
      country: "Japan",
      club: "Free Agent",
      career: "Rookie",
      players: [],
      activePlayer: null,
      unlockedFlows: [],
      activeFlow: null,
      flowCooldown: 0,
      stamina: 100,
      trophies: [],
      stats: {
        matches: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        motm: 0,
        bestRating: 0
      },
      clubInterest: [],
      offers: []
    };

    save();
  }

  const p = db[id];

  // Backfill new fields for old saves.
  if (!Array.isArray(p.team)) p.team = [];
  if (!Array.isArray(p.offers)) p.offers = [];
  if (!Array.isArray(p.trophies)) p.trophies = [];
  if (!Array.isArray(p.clubInterest)) p.clubInterest = [];
  if (!p.season) p.season = newSeason(1);
  if (p.contract === undefined) p.contract = null;
  if (!p.league) p.league = "—";
  if (!p.offerSeq) p.offerSeq = 0;

  return p;
}

/* =========================
   XP / LEVEL
========================= */

function addXP(p, amount) {
  p.xp += amount;

  while (p.xp >= p.level * 100) {
    p.xp -= p.level * 100;
    p.level++;
    p.rating = Math.min(99, p.rating + 1);
  }
}

/* =========================
   CLUBS, LEAGUES & TROPHIES
========================= */

const SEASON_MATCHES = 8;   // matches per season
const TEAM_MAX = 10;        // max teammates

const LEAGUES = {
  "Neo Egoist League": { title: "Neo Egoist League Title", cup: null, leagueCup: null, superCup: null, confed: null },
  "Premier League": { title: "Premier League Title", cup: "FA Cup", leagueCup: "EFL Cup", superCup: "FA Community Shield", confed: "UEFA" },
  "La Liga": { title: "La Liga Title", cup: "Copa del Rey", leagueCup: null, superCup: "Supercopa de España", confed: "UEFA" },
  "Bundesliga": { title: "Bundesliga Title", cup: "DFB-Pokal", leagueCup: null, superCup: "DFL-Supercup", confed: "UEFA" },
  "Serie A": { title: "Serie A Title", cup: "Coppa Italia", leagueCup: null, superCup: "Supercoppa Italiana", confed: "UEFA" },
  "Ligue 1": { title: "Ligue 1 Title", cup: "Coupe de France", leagueCup: null, superCup: "Trophée des Champions", confed: "UEFA" },
  "Eredivisie": { title: "Eredivisie Title", cup: "KNVB Cup", leagueCup: null, superCup: "Johan Cruyff Shield", confed: "UEFA" },
  "Primeira Liga": { title: "Primeira Liga Title", cup: "Taça de Portugal", leagueCup: "Taça da Liga", superCup: "Supertaça Cândido de Oliveira", confed: "UEFA" },
  "Süper Lig": { title: "Süper Lig Title", cup: "Turkish Cup", leagueCup: null, superCup: "Turkish Super Cup", confed: "UEFA" },
  "Scottish Premiership": { title: "Scottish Premiership Title", cup: "Scottish Cup", leagueCup: "Scottish League Cup", superCup: null, confed: "UEFA" },
  "J1 League": { title: "J1 League Title", cup: "Emperor's Cup", leagueCup: "J.League Cup", superCup: "Japanese Super Cup", confed: "AFC" },
  "Saudi Pro League": { title: "Saudi Pro League Title", cup: "King's Cup", leagueCup: null, superCup: "Saudi Super Cup", confed: "AFC" },
  "MLS": { title: "MLS Cup", cup: "U.S. Open Cup", leagueCup: "Leagues Cup", superCup: null, confed: "CONCACAF" },
  "Brasileirão": { title: "Brasileirão Title", cup: "Copa do Brasil", leagueCup: null, superCup: "Supercopa do Brasil", confed: "CONMEBOL" },
  "Liga Profesional": { title: "Argentine Primera División Title", cup: "Copa Argentina", leagueCup: null, superCup: "Supercopa Argentina", confed: "CONMEBOL" }
};

const CONTINENTAL = {
  AFC: "AFC Champions League Elite",
  CONMEBOL: "Copa Libertadores",
  CONCACAF: "CONCACAF Champions Cup"
};

// [name, league, tier]   tier 1 = elite ... 4 = smaller club
const CLUBS = [
  ["Bastard München", "Neo Egoist League", 1],
  ["FC Barcha", "Neo Egoist League", 1],
  ["Manshine City", "Neo Egoist League", 1],
  ["Ubers", "Neo Egoist League", 1],
  ["Paris X Gen", "Neo Egoist League", 1],
  ["Re Al", "La Liga", 1],

  ["Manchester City", "Premier League", 1],
  ["Liverpool", "Premier League", 1],
  ["Arsenal", "Premier League", 1],
  ["Chelsea", "Premier League", 2],
  ["Manchester United", "Premier League", 2],
  ["Tottenham", "Premier League", 2],
  ["Newcastle United", "Premier League", 3],
  ["Aston Villa", "Premier League", 3],
  ["Brighton", "Premier League", 4],

  ["Real Madrid", "La Liga", 1],
  ["Barcelona", "La Liga", 1],
  ["Atlético Madrid", "La Liga", 2],
  ["Sevilla", "La Liga", 3],
  ["Real Sociedad", "La Liga", 3],
  ["Villarreal", "La Liga", 3],
  ["Athletic Club", "La Liga", 3],
  ["Valencia", "La Liga", 4],

  ["Bayern Munich", "Bundesliga", 1],
  ["Borussia Dortmund", "Bundesliga", 2],
  ["Bayer Leverkusen", "Bundesliga", 2],
  ["RB Leipzig", "Bundesliga", 2],
  ["Eintracht Frankfurt", "Bundesliga", 3],
  ["VfB Stuttgart", "Bundesliga", 3],

  ["Inter", "Serie A", 1],
  ["AC Milan", "Serie A", 2],
  ["Juventus", "Serie A", 2],
  ["Napoli", "Serie A", 2],
  ["Roma", "Serie A", 3],
  ["Lazio", "Serie A", 3],
  ["Atalanta", "Serie A", 3],
  ["Fiorentina", "Serie A", 4],

  ["Paris Saint-Germain", "Ligue 1", 1],
  ["Monaco", "Ligue 1", 2],
  ["Marseille", "Ligue 1", 3],
  ["Lyon", "Ligue 1", 3],
  ["Lille", "Ligue 1", 4],

  ["Ajax", "Eredivisie", 3],
  ["PSV Eindhoven", "Eredivisie", 3],
  ["Feyenoord", "Eredivisie", 3],

  ["Benfica", "Primeira Liga", 2],
  ["Porto", "Primeira Liga", 2],
  ["Sporting CP", "Primeira Liga", 2],

  ["Galatasaray", "Süper Lig", 3],
  ["Fenerbahçe", "Süper Lig", 3],
  ["Beşiktaş", "Süper Lig", 4],

  ["Celtic", "Scottish Premiership", 3],
  ["Rangers", "Scottish Premiership", 3],

  ["Vissel Kobe", "J1 League", 3],
  ["Yokohama F. Marinos", "J1 League", 3],
  ["Urawa Reds", "J1 League", 3],
  ["Kashima Antlers", "J1 League", 3],
  ["Kawasaki Frontale", "J1 League", 3],
  ["Gamba Osaka", "J1 League", 4],
  ["Sanfrecce Hiroshima", "J1 League", 4],

  ["Al Hilal", "Saudi Pro League", 2],
  ["Al Nassr", "Saudi Pro League", 2],
  ["Al Ittihad", "Saudi Pro League", 3],
  ["Al Ahli", "Saudi Pro League", 3],

  ["Inter Miami", "MLS", 3],
  ["LA Galaxy", "MLS", 3],
  ["LAFC", "MLS", 3],
  ["Seattle Sounders", "MLS", 4],

  ["Flamengo", "Brasileirão", 2],
  ["Palmeiras", "Brasileirão", 2],
  ["Corinthians", "Brasileirão", 3],
  ["São Paulo", "Brasileirão", 3],

  ["Boca Juniors", "Liga Profesional", 2],
  ["River Plate", "Liga Profesional", 2]
];

const CLUB_LIST = CLUBS.map(([name, league, tier]) => ({ name, league, tier }));

const CLUB_ALIASES = {
  "man city": "Manchester City",
  "city": "Manchester City",
  "man utd": "Manchester United",
  "man united": "Manchester United",
  "united": "Manchester United",
  "spurs": "Tottenham",
  "real": "Real Madrid",
  "barca": "Barcelona",
  "atletico": "Atlético Madrid",
  "bayern": "Bayern Munich",
  "dortmund": "Borussia Dortmund",
  "bvb": "Borussia Dortmund",
  "leipzig": "RB Leipzig",
  "juve": "Juventus",
  "milan": "AC Milan",
  "psg": "Paris Saint-Germain",
  "paris": "Paris X Gen",
  "pxg": "Paris X Gen",
  "munchen": "Bastard München",
  "munich": "Bastard München",
  "bm": "Bastard München",
  "manshine": "Manshine City",
  "miami": "Inter Miami",
  "galaxy": "LA Galaxy",
  "kobe": "Vissel Kobe",
  "marinos": "Yokohama F. Marinos",
  "boca": "Boca Juniors",
  "river": "River Plate"
};

function findClub(input, fuzzy = true) {
  const q = clean(input);
  if (!q) return null;

  if (CLUB_ALIASES[q]) {
    return CLUB_LIST.find(c => c.name === CLUB_ALIASES[q]) || null;
  }

  return smartFind(input, CLUB_LIST, fuzzy);
}

function findLeague(input) {
  const list = Object.keys(LEAGUES).map(name => ({ name }));
  const hit = smartFind(input, list, true);
  return hit ? hit.name : null;
}

const TIER_INFO = {
  1: { min: 88, bonus: 500000, wage: 8000 },
  2: { min: 78, bonus: 250000, wage: 5000 },
  3: { min: 68, bonus: 120000, wage: 3000 },
  4: { min: 0, bonus: 50000, wage: 1500 }
};

/* ---------- Trophies ---------- */

const GLOBAL_TROPHIES = [
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "UEFA Super Cup",
  "FIFA Club World Cup",
  "AFC Champions League Elite",
  "Copa Libertadores",
  "CONCACAF Champions Cup",
  "FIFA World Cup",
  "UEFA European Championship",
  "Copa América",
  "AFC Asian Cup",
  "Africa Cup of Nations",
  "CONCACAF Gold Cup",
  "UEFA Nations League",
  "Olympic Gold Medal",
  "Ballon d'Or",
  "FIFA The Best",
  "Puskás Award",
  "World Cup Golden Boot",
  "World Cup Golden Ball",
  "Golden Glove",
  "Neo Egoist League MVP"
];

function buildTrophyCatalog() {
  const list = [...GLOBAL_TROPHIES];

  for (const [name, l] of Object.entries(LEAGUES)) {
    list.push(l.title);
    if (l.cup) list.push(l.cup);
    if (l.leagueCup) list.push(l.leagueCup);
    if (l.superCup) list.push(l.superCup);

    list.push(
      `${name} Golden Boot`,
      `${name} Player of the Season`,
      `${name} Team of the Season`
    );
  }

  return [...new Set(list)];
}

const TROPHY_CATALOG = buildTrophyCatalog();
const TROPHY_LIST = TROPHY_CATALOG.map(name => ({ name }));

function findTrophy(input) {
  return smartFind(input, TROPHY_LIST, true);
}

const COUNTRY_CONFED = {
  "Japan": "AFC", "South Korea": "AFC", "Australia": "AFC", "Saudi Arabia": "AFC",
  "Germany": "UEFA", "France": "UEFA", "Italy": "UEFA", "England": "UEFA", "Spain": "UEFA",
  "Portugal": "UEFA", "Netherlands": "UEFA", "Belgium": "UEFA", "Croatia": "UEFA",
  "Brazil": "CONMEBOL", "Argentina": "CONMEBOL", "Uruguay": "CONMEBOL", "Colombia": "CONMEBOL",
  "USA": "CONCACAF", "Mexico": "CONCACAF",
  "Senegal": "CAF", "Nigeria": "CAF", "Morocco": "CAF", "Ghana": "CAF"
};

const CONFED_CUP = {
  UEFA: "UEFA European Championship",
  CONMEBOL: "Copa América",
  AFC: "AFC Asian Cup",
  CAF: "Africa Cup of Nations",
  CONCACAF: "CONCACAF Gold Cup"
};

const INTERNATIONAL_SCHEDULE = {
  0: "🌍 FIFA World Cup",
  1: "🇪🇺 UEFA Nations League (UEFA nations)",
  2: "🏆 Continental Championship (Euro / Copa América / Asian Cup...)",
  3: "🥇 Olympic Games"
};

function newSeason(number) {
  return {
    number,
    matches: 0,
    wins: 0,
    draws: 0,
    goals: 0,
    assists: 0,
    ratingSum: 0
  };
}

function isAward(name) {
  return /Ballon|Best|Puskás|Golden|Player of|Team of|MVP/.test(name);
}

function trophyCounts(p) {
  const counts = new Map();

  for (const t of p.trophies) {
    const name = typeof t === "string" ? t : t.name;
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return counts;
}

function trophyEmbed(userId, title) {
  const p = getPlayer(userId);
  const counts = trophyCounts(p);

  const lines = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) =>
      `${isAward(name) ? "⭐" : "🏆"} ${name}${n > 1 ? ` ×${n}` : ""}`
    );

  return new EmbedBuilder()
    .setTitle(title || "🏆 Trophy Cabinet")
    .setDescription(
      lines.length
        ? lines.join("\n").slice(0, 4000)
        : "Your cabinet is empty. Play matches and finish seasons to win trophies!"
    )
    .addFields(
      { name: "Total", value: `${p.trophies.length}`, inline: true },
      { name: "Season", value: `${p.season.number}`, inline: true }
    );
}

function trophyCatalogEmbed() {
  return new EmbedBuilder()
    .setTitle(`🏆 All Trophies & Awards (${TROPHY_CATALOG.length})`)
    .setDescription(
      TROPHY_CATALOG.map(t => `${isAward(t) ? "⭐" : "🏆"} ${t}`).join("\n").slice(0, 4000)
    );
}

function seasonEmbed(userId) {
  const p = getPlayer(userId);
  const s = p.season;

  const avg = s.matches ? (s.ratingSum / s.matches).toFixed(2) : "—";
  const losses = s.matches - s.wins - s.draws;

  return new EmbedBuilder()
    .setTitle(`📅 Season ${s.number}`)
    .setDescription(
      `Progress: **${s.matches}/${SEASON_MATCHES}** matches\n` +
      `Trophies are decided when the season ends.`
    )
    .addFields(
      { name: "Club", value: p.club, inline: true },
      { name: "League", value: p.league, inline: true },
      { name: "Record", value: `${s.wins}W ${s.draws}D ${losses}L`, inline: true },
      { name: "Goals", value: `${s.goals}`, inline: true },
      { name: "Assists", value: `${s.assists}`, inline: true },
      { name: "Avg Rating", value: `${avg}`, inline: true },
      { name: "International event", value: INTERNATIONAL_SCHEDULE[s.number % 4] }
    );
}

/* ---------- End of season: decide trophies ---------- */

function endSeason(userId) {
  const p = getPlayer(userId);
  const s = p.season;

  const char = p.activePlayer ? findCharacter(p.activePlayer, false) : null;
  const ovr = char?.rating || p.rating;
  const position = char?.position || p.position;
  const country = char?.country || p.country;

  const club = findClub(p.club, false);
  const league = club ? LEAGUES[club.league] : null;

  const played = Math.max(1, s.matches);
  const avg = s.ratingSum / played;
  const winRate = s.wins / played;

  const tierBonus = { 1: 0.12, 2: 0.06, 3: 0, 4: -0.06 }[club?.tier] ?? -0.06;

  const strength = Math.max(
    0.1,
    Math.min(0.92, 0.2 + winRate * 0.45 + ((avg - 6) / 4) * 0.35 + tierBonus)
  );

  const won = [];
  const give = name => {
    p.trophies.push({ name, season: s.number, club: p.club });
    won.push(name);
  };
  const roll = x => Math.random() < x;

  let wonLeague = false;
  let wonCup = false;
  let wonContinental = false;

  if (league) {
    if (roll(strength)) { give(league.title); wonLeague = true; }
    if (league.cup && roll(strength * 0.7)) { give(league.cup); wonCup = true; }
    if (league.leagueCup && roll(strength * 0.6)) give(league.leagueCup);
    if (league.superCup && (wonLeague || wonCup) && roll(strength * 0.6)) give(league.superCup);

    // Continental competition
    let cont = null;
    let factor = 0.55;

    if (league.confed === "UEFA") {
      if (club.tier <= 2 || wonLeague) { cont = "UEFA Champions League"; factor = 0.5; }
      else if (club.tier === 3) { cont = "UEFA Europa League"; factor = 0.6; }
      else { cont = "UEFA Conference League"; factor = 0.65; }
    } else if (league.confed) {
      cont = CONTINENTAL[league.confed];
    }

    if (cont && roll(strength * factor)) {
      give(cont);
      wonContinental = true;

      if (cont === "UEFA Champions League" && roll(0.55)) give("UEFA Super Cup");
      if (roll(0.45)) give("FIFA Club World Cup");
    }

    // League awards
    if (s.goals >= 6 && roll(0.7)) give(`${club.league} Golden Boot`);
    if (avg >= 7.6 && roll(0.6)) give(`${club.league} Player of the Season`);
    if (avg >= 7.0 && roll(0.7)) give(`${club.league} Team of the Season`);

    if (club.league === "Neo Egoist League" && avg >= 7.8 && roll(0.6)) {
      give("Neo Egoist League MVP");
    }
  }

  if (position === "GK" && avg >= 7.2 && roll(0.6)) give("Golden Glove");
  if (s.goals >= 3 && roll(0.08)) give("Puskás Award");

  if (avg >= 8.2 && (wonLeague || wonContinental) && s.goals + s.assists >= 6) {
    if (roll(0.65)) give("Ballon d'Or");
    else if (roll(0.5)) give("FIFA The Best");
  }

  // International tournaments
  const natStrength = Math.max(
    0.05,
    Math.min(0.75, 0.1 + ((ovr - 60) / 100) * 0.45 + ((avg - 6) / 4) * 0.3 + winRate * 0.15)
  );

  const confed = COUNTRY_CONFED[country];
  const step = s.number % 4;

  if (step === 0) {
    if (roll(natStrength)) {
      give("FIFA World Cup");
      if (avg >= 7.5 && roll(0.6)) give("World Cup Golden Ball");
    }
    if (s.goals >= 6 && roll(0.4)) give("World Cup Golden Boot");
  } else if (step === 1) {
    if (confed === "UEFA" && roll(natStrength * 0.8)) give("UEFA Nations League");
  } else if (step === 2) {
    if (confed && roll(natStrength * 0.9)) give(CONFED_CUP[confed]);
  } else if (step === 3) {
    if (roll(natStrength * 0.7)) give("Olympic Gold Medal");
  }

  const summary = { number: s.number, won, avg };

  p.season = newSeason(s.number + 1);

  return summary;
}

function recordSeason(userId, m, finalRating, result) {
  const p = getPlayer(userId);
  const s = p.season;

  s.matches++;
  if (result === "win") s.wins++;
  if (result === "draw") s.draws++;
  s.goals += m.stats.goals;
  s.assists += m.stats.assists;
  s.ratingSum += finalRating;

  if (s.matches >= SEASON_MATCHES) return endSeason(userId);

  return null;
}

/* ---------- Club offers ---------- */

function makeOffer(userId, finalRating, playerRating) {
  const p = getPlayer(userId);

  if (p.offers.length >= 5) return null;
  if (finalRating < 7.5) return null;

  const chance = Math.min(0.9, (finalRating - 7) * 0.5);
  if (Math.random() > chance) return null;

  const taken = new Set([p.club, ...p.offers.map(o => o.club)]);
  const bonusRating = finalRating >= 8.5 ? 4 : 0;

  const pool = CLUB_LIST.filter(
    c => !taken.has(c.name) && TIER_INFO[c.tier].min <= playerRating + bonusRating
  );

  if (!pool.length) return null;

  // Great games attract bigger clubs.
  const weightOf = c =>
    finalRating >= 8.5
      ? { 1: 4, 2: 3, 3: 1, 4: 0.5 }[c.tier]
      : { 1: 1, 2: 2, 3: 3, 4: 3 }[c.tier];

  const total = pool.reduce((sum, c) => sum + weightOf(c), 0);
  let pick = Math.random() * total;
  let club = pool[0];

  for (const c of pool) {
    pick -= weightOf(c);
    if (pick <= 0) { club = c; break; }
  }

  return addOffer(userId, club);
}

function addOffer(userId, club) {
  const p = getPlayer(userId);
  const info = TIER_INFO[club.tier];

  p.offerSeq++;

  const offer = {
    id: p.offerSeq,
    club: club.name,
    league: club.league,
    tier: club.tier,
    wage: info.wage,
    bonus: info.bonus
  };

  p.offers.push(offer);
  p.clubInterest.push(club.name);
  if (p.clubInterest.length > 20) p.clubInterest.shift();

  save();
  return offer;
}

function offerView(userId) {
  const p = getPlayer(userId);

  if (!p.offers.length) {
    return {
      content: "📭 You have no club offers right now. Play well in matches (7.5+ rating) to attract clubs!"
    };
  }

  const o = p.offers[0];

  const embed = new EmbedBuilder()
    .setTitle(`📩 Offer from ${o.club}`)
    .setDescription(
      `**${o.club}** (${o.league}) wants to sign you!\n` +
      `You have **${p.offers.length}** pending offer${p.offers.length > 1 ? "s" : ""}.`
    )
    .addFields(
      { name: "Signing Bonus", value: `${o.bonus.toLocaleString()} coins`, inline: true },
      { name: "Wage", value: `${o.wage.toLocaleString()} / match`, inline: true },
      { name: "Club Tier", value: `${o.tier}`, inline: true },
      { name: "Current Club", value: p.club, inline: true }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`offer_accept_${userId}_${o.id}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`offer_deny_${userId}_${o.id}`)
      .setLabel("Deny")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

function applyClub(userId, clubName) {
  const p = getPlayer(userId);
  const c = findClub(clubName, false);

  p.club = c ? c.name : clubName;
  p.league = c ? c.league : "—";

  return cleanTeam(userId);
}

async function processOffer(interaction, action, userId, offerId) {
  const p = getPlayer(userId);

  const idx = p.offers.findIndex(o => String(o.id) === String(offerId));

  if (idx === -1) {
    return interaction.update({
      content: "❌ This offer is no longer available.",
      embeds: [],
      components: []
    });
  }

  const offer = p.offers[idx];
  p.offers.splice(idx, 1);

  let text;

  if (action === "accept") {
    p.coins += offer.bonus;
    p.contract = { club: offer.club, wage: offer.wage };

    const removed = applyClub(userId, offer.club);

    text =
      `✅ You signed for **${offer.club}**!\n` +
      `💰 Signing bonus: **${offer.bonus.toLocaleString()} coins**\n` +
      `💼 Wage: **${offer.wage.toLocaleString()} / match**`;

    if (removed.length) {
      text += `\n🔄 Left your team (different club): ${removed.join(", ")}`;
    }
  } else {
    text = `❌ You declined the offer from **${offer.club}**.`;
  }

  save();

  const next = offerView(userId);

  if (!p.offers.length) {
    return interaction.update({ content: text, embeds: [], components: [] });
  }

  return interaction.update({
    content: text,
    embeds: next.embeds,
    components: next.components
  });
}

/* ---------- Team (squad) ---------- */

function clubKeyOf(p) {
  return !p.club || p.club === "Free Agent" ? "Blue Lock" : p.club;
}

function clubCharacterPool(p) {
  const key = clubKeyOf(p);
  return Object.values(characters).filter(c => c.club === key);
}

// Removes invalid teammates and returns the names removed.
function cleanTeam(userId) {
  const p = getPlayer(userId);
  const owner = userId === OWNER_ID;

  const pool = new Set(clubCharacterPool(p).map(c => c.name));
  const active = p.activePlayer ? findCharacter(p.activePlayer, false)?.name : null;

  const seen = new Set();
  const removed = [];

  p.team = p.team.filter(name => {
    const c = findCharacter(name, false);

    if (!c) { removed.push(name); return false; }
    if (seen.has(c.name)) return false;

    if (active && c.name === active) { removed.push(c.name); return false; }
    if (!owner && !pool.has(c.name)) { removed.push(c.name); return false; }

    seen.add(c.name);
    return true;
  });

  return removed;
}

function getTeamMembers(userId) {
  cleanTeam(userId);

  return getPlayer(userId).team
    .map(n => findCharacter(n, false))
    .filter(Boolean);
}

function teamAction(userId, sub, input) {
  const p = getPlayer(userId);
  const owner = userId === OWNER_ID;

  cleanTeam(userId);

  if (sub === "add") {
    const c = findCharacter(input);

    if (!c) return { content: "❌ Character not found." };

    if (!owner && !p.players.includes(c.name)) {
      return { content: "❌ You don't own this character." };
    }

    if (!owner && c.club !== clubKeyOf(p)) {
      return {
        content:
          `❌ **${c.name}** plays for **${c.club}**, not your club (**${clubKeyOf(p)}**).\n` +
          `Your team can only use characters from your club.`
      };
    }

    const active = p.activePlayer ? findCharacter(p.activePlayer, false)?.name : null;

    if (active === c.name) {
      return { content: `❌ **${c.name}** is already your active player — a character can't be used twice.` };
    }

    if (p.team.includes(c.name)) {
      return { content: `❌ **${c.name}** is already in your team — no duplicates.` };
    }

    if (p.team.length >= TEAM_MAX) {
      return { content: `❌ Your team is full (${TEAM_MAX}/${TEAM_MAX}).` };
    }

    p.team.push(c.name);
    save();

    return { content: `✅ **${c.name}** joined your team (${p.team.length}/${TEAM_MAX}).` };
  }

  if (sub === "remove") {
    const c = findCharacter(input);

    if (!c || !p.team.includes(c.name)) {
      return { content: "❌ That character isn't in your team." };
    }

    p.team = p.team.filter(n => n !== c.name);
    save();

    return { content: `✅ **${c.name}** removed from your team.` };
  }

  // view
  const members = getTeamMembers(userId);
  const active = p.activePlayer ? findCharacter(p.activePlayer, false)?.name : null;

  const available = clubCharacterPool(p)
    .filter(c => p.players.includes(c.name) && !p.team.includes(c.name) && c.name !== active)
    .map(c => c.name);

  const bonus = Math.min(12, members.length * 2);

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`🤝 Your Team — ${clubKeyOf(p)}`)
        .setDescription(
          members.length
            ? members.map(c => `• **${c.name}** — ${c.rating} OVR (${c.position})`).join("\n")
            : "No teammates yet. Use `,addteam <character>`."
        )
        .addFields(
          { name: "Slots", value: `${members.length}/${TEAM_MAX}`, inline: true },
          { name: "Match Bonus", value: `+${bonus}% success`, inline: true },
          {
            name: "Available from your club",
            value: available.length ? available.join(", ").slice(0, 1000) : "None (roll more characters!)"
          }
        )
    ]
  };
}

/* =========================
   MATCH SYSTEM
========================= */

const matches = new Map();

/* ---------- Flow skills ---------- */

// Extra things ONLY the owner can pick in the skill menu.
const OWNER_SKILLS = [
  { name: "Instant Goal (Owner)", type: "shoot" },
  { name: "Perfect Assist (Owner)", type: "pass" },
  { name: "Unstoppable Dribble (Owner)", type: "dribble" },
  { name: "Total Defense (Owner)", type: "defend" }
];

const SKILL_TYPE_LABELS = {
  shoot: "🎯 Shot — can score a goal",
  pass: "🧠 Pass — can create an assist",
  dribble: "🌀 Dribble — beats defenders",
  defend: "🛡️ Defend — blocks the next opponent goal"
};

// Cooldown in match actions after a skill is used.
const SKILL_COOLDOWN = {
  shoot: 3,
  pass: 2,
  dribble: 2,
  defend: 3
};

const SKILL_TYPE_OVERRIDES = {
  "meta vision": "shoot",
  "master vision": "shoot",
  "emperor's eye": "shoot"
};

const POSITION_DEFAULT_TYPE = {
  ST: "shoot",
  LW: "dribble",
  RW: "dribble",
  CM: "pass",
  CB: "defend",
  GK: "defend"
};

function skillType(name, position) {
  const n = normalize(name);

  if (SKILL_TYPE_OVERRIDES[n]) return SKILL_TYPE_OVERRIDES[n];

  if (/(mark|eater|defen|intercept|aerial|height|reach|save|reflex|tackle|wall|block|guard|lock|clear|duel|shield|cover)/.test(n)) {
    return "defend";
  }

  if (/(shot|impact|volley|revolver|snipe|finish|drive|strike|magnus|destroyer|shoot|lightning|header|gun|blast|punch)/.test(n)) {
    return "shoot";
  }

  if (/(dribble|elastico|trap|speed|sprint|run|acceleration|feint|ball keeping|dance|magician|monster|cut inside|1v1|stealth|chameleon|solo|control|trick|off ball|panther|step|flick|nutmeg|dash|turn|rush|charge)/.test(n)) {
    return "dribble";
  }

  if (/(pass|assist|thread|vision|creative|analyst|tactic|cross|lob|through)/.test(n)) {
    return "pass";
  }

  return POSITION_DEFAULT_TYPE[position] || "shoot";
}

// The skills this player can pick from in Flow State.
function getFlowSkills(userId) {
  const p = getPlayer(userId);

  const c = p.activePlayer ? findCharacter(p.activePlayer, false) : null;

  let names = [];
  let position = p.position;

  if (c) {
    names = [...c.skills];
    position = c.position;
  } else if (p.activeFlow) {
    const f = findFlow(p.activeFlow);
    if (f) names = [...f.abilities];
  }

  const list = names.map(n => ({
    name: n,
    type: skillType(n, position)
  }));

  if (userId === OWNER_ID) list.push(...OWNER_SKILLS);

  return list.slice(0, 25);
}

function cooldownLeft(m, skillName) {
  return m.cooldowns[skillName] || 0;
}

// Called after every player action.
function tickCooldowns(m) {
  for (const k of Object.keys(m.cooldowns)) {
    m.cooldowns[k]--;
    if (m.cooldowns[k] <= 0) delete m.cooldowns[k];
  }
}

/*
  How many times you can enter Flow State in one match.
  Depends on your player: stronger players and players who are
  playing well get more Flow States.
*/
function maxFlowUses(m) {
  let n = 1;

  if (m.rating >= 90) n++;
  if (m.rating >= 97) n++;

  const current = calculateRating(m.stats, "draw", m.position);
  if (current >= 8.5) n++;

  return Math.min(4, n);
}

// Can this player start (or reopen) Flow State right now?
function flowReady(userId, m) {
  if (userId === OWNER_ID) return true;
  if (m.flowActive) return true;

  return (m.bestMoment || m.worstMoment) && m.flowUses < maxFlowUses(m);
}

function skillMenu(userId) {
  const m = matches.get(userId);
  const owner = userId === OWNER_ID;

  const options = getFlowSkills(userId).map(sk => {
    const cd = owner ? 0 : cooldownLeft(m, sk.name);

    return {
      label: ((cd ? "⏳ " : "") + sk.name).slice(0, 100),
      value: sk.name.slice(0, 100),
      description: (
        cd
          ? `⏳ Cooldown: ${cd} more action${cd > 1 ? "s" : ""}`
          : SKILL_TYPE_LABELS[sk.type]
      ).slice(0, 100)
    };
  });

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`flowskill_${userId}`)
      .setPlaceholder("Choose a skill to use")
      .addOptions(options)
  );
}

function skillMenuText(m, userId) {
  const owner = userId === OWNER_ID;

  return (
    `🔥 **FLOW STATE**\n` +
    `Choose a skill below. Only you can see this.\n` +
    `⚡ Actions left: **${owner ? "∞" : m.flowLeft}**\n` +
    `🔁 Flow States used: **${owner ? "∞" : `${m.flowUses}/${maxFlowUses(m)}`}**`
  );
}

// Does the skill work? Returns the text to show.
function performSkill(m, p, owner, skill) {
  const chance = Math.min(0.95, m.rating / 120 + 0.3 + m.teamBonus);
  const success = owner || Math.random() < chance;
  const title = `✨ **${skill.name}**\n`;

  if (skill.type === "shoot") {
    if (success) {
      m.score++;
      m.stats.goals++;
      m.stats.shotsOnTarget++;
      m.bestMoment = true;
      m.worstMoment = false;
      addXP(p, 45);
      return title + "⚽ **GOAL!**";
    }

    m.stats.missedChances++;
    return title + "❌ The keeper got a hand to it.";
  }

  if (skill.type === "pass") {
    if (success) {
      m.stats.keyPasses++;

      if (owner || Math.random() < 0.6) {
        m.stats.assists++;
        m.bestMoment = true;
        m.worstMoment = false;
        return title + "🎯 **ASSIST!** Perfect pass.";
      }

      return title + "✅ Key pass created.";
    }

    m.stats.badPasses++;
    return title + "❌ The pass was cut out.";
  }

  if (skill.type === "dribble") {
    if (success) {
      m.stats.dribbles++;
      m.bestMoment = true;
      m.worstMoment = false;
      return title + "🌀 You beat the defender!";
    }

    m.stats.turnovers++;
    return title + "❌ You lost the ball.";
  }

  // defend
  if (success) {
    if (Math.random() < 0.5) m.stats.tackles++;
    else m.stats.interceptions++;

    m.shield = true;
    return title + "🛡️ Great defending! The next opponent goal is blocked.";
  }

  m.stats.turnovers++;
  return title + "❌ You were beaten.";
}

/* ---------- Match ---------- */

function createMatch(userId) {
  const p = getPlayer(userId);
  const character = p.activePlayer
    ? findCharacter(p.activePlayer, false)
    : null;

  const team = getTeamMembers(userId);
  const defenders = team.filter(c => c.position === "CB" || c.position === "GK").length;

  const match = {
    userId,
    minute: 1,
    score: 0,
    opponentScore: 0,

    // Whether the player currently has a chance
    hasChance: userId === OWNER_ID,

    bestMoment: false,
    worstMoment: false,
    flowActive: false,
    flowLeft: 0,
    flowUses: 0,
    cooldowns: {},
    shield: false,
    finished: false,
    message: null,

    teamSize: team.length,
    teamBonus: Math.min(0.12, team.length * 0.02),
    defenders,

    stats: {
      goals: 0,
      assists: 0,
      shotsOnTarget: 0,
      keyPasses: 0,
      dribbles: 0,
      tackles: 0,
      interceptions: 0,
      missedChances: 0,
      badPasses: 0,
      turnovers: 0
    },

    position: character?.position || p.position,
    rating: character?.rating || p.rating
  };

  matches.set(userId, match);
  return match;
}


/* =========================
   REALISTIC RATING
========================= */

function calculateRating(stats, result, position) {
  let rating = 6.2;

  rating += stats.goals * 0.9;
  rating += stats.assists * 0.65;
  rating += stats.shotsOnTarget * 0.12;
  rating += stats.keyPasses * 0.1;
  rating += stats.dribbles * 0.07;

  if (position === "CB" || position === "GK") {
    rating += stats.tackles * 0.1;
    rating += stats.interceptions * 0.12;
  }

  rating -= stats.missedChances * 0.15;
  rating -= stats.badPasses * 0.07;
  rating -= stats.turnovers * 0.05;

  if (result === "win") rating += 0.3;
  if (result === "loss") rating -= 0.3;

  return Math.max(
    4.5,
    Math.min(10, Number(rating.toFixed(1)))
  );
}


/* =========================
   MATCH EMBED
========================= */

function matchEmbed(userId) {
  const m = matches.get(userId);
  const p = getPlayer(userId);

  const owner = userId === OWNER_ID;

  const result =
    m.score > m.opponentScore
      ? "win"
      : m.score < m.opponentScore
      ? "loss"
      : "draw";

  const rating = calculateRating(
    m.stats,
    result,
    m.position
  );

  let chanceText;

  if (owner) {
    chanceText = "🔥 **CHANCE AVAILABLE**";
  } else if (m.hasChance) {
    chanceText = "⚡ **CHANCE AVAILABLE**";
  } else {
    chanceText = "⏳ **No chance right now** — press **Continue**";
  }

  let flowText;

  if (m.flowActive) {
    flowText = `🔥 **FLOW STATE** (${owner ? "∞" : m.flowLeft} left)`;
  } else if (p.activeFlow) {
    flowText =
      `${p.activeFlow} ${flowReady(userId, m) ? "🟢" : "🔒"}` +
      (owner ? "" : ` (${m.flowUses}/${maxFlowUses(m)} used)`);
  } else {
    flowText = owner ? "👑 Owner" : "None";
  }

  const fields = [
    { name: "Goals", value: `${m.stats.goals}`, inline: true },
    { name: "Assists", value: `${m.stats.assists}`, inline: true },
    { name: "Dribbles", value: `${m.stats.dribbles}`, inline: true },
    { name: "Key Passes", value: `${m.stats.keyPasses}`, inline: true },
    { name: "Best Moment", value: m.bestMoment ? "🔥 ACTIVE" : "—", inline: true },
    { name: "Worst Moment", value: m.worstMoment ? "💀 ACTIVE" : "—", inline: true },
    { name: "Flow", value: flowText, inline: true }
  ];

  if (m.teamSize) {
    fields.push({
      name: "🤝 Team",
      value: `${m.teamSize} teammate${m.teamSize > 1 ? "s" : ""} (+${Math.round(m.teamBonus * 100)}%)`,
      inline: true
    });
  }

  const cds = Object.entries(m.cooldowns);

  if (cds.length && !owner) {
    fields.push({
      name: "⏳ Skill Cooldowns",
      value: cds.map(([n, v]) => `${n} (${v})`).join(", ").slice(0, 1000)
    });
  }

  return new EmbedBuilder()
    .setColor(m.flowActive ? 0xff6a00 : 0x2b6cb0)
    .setTitle(m.flowActive ? "🔥 BLUE LOCK MATCH — FLOW STATE" : "⚽ BLUE LOCK MATCH")
    .setDescription(
      `### ${m.score} - ${m.opponentScore}\n\n` +
      `⏱️ **${m.minute}'**\n` +
      `⭐ Match Rating: **${rating}**\n\n` +
      `${chanceText}`
    )
    .addFields(fields);
}


/* =========================
   MATCH BUTTONS
========================= */

function matchButtons(userId) {
  const m = matches.get(userId);
  const p = getPlayer(userId);

  const owner = userId === OWNER_ID;

  const chance = owner || m.hasChance;

  return [
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`match_shoot_${userId}`)
        .setLabel("Shoot")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!chance),

      new ButtonBuilder()
        .setCustomId(`match_pass_${userId}`)
        .setLabel("Pass")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!chance),

      new ButtonBuilder()
        .setCustomId(`match_dribble_${userId}`)
        .setLabel("Dribble")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!chance),

      new ButtonBuilder()
        .setCustomId(`match_flow_${userId}`)
        .setLabel("Flow")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(
          !chance ||
          (!owner && !p.activeFlow) ||
          !flowReady(userId, m)
        ),

      // Moves the match forward when you have no chance.
      new ButtonBuilder()
        .setCustomId(`match_continue_${userId}`)
        .setLabel("⏭️ Continue")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(chance)
    )
  ];
}


/* =========================
   ADVANCE MATCH TIME
========================= */

function advanceMatch(m) {

  /*
    Instead of giving the player an action every
    minute, the match jumps forward randomly.
  */

  const jump =
    Math.floor(Math.random() * 9) + 2;

  m.minute += jump;

  if (m.minute > 90) {
    m.minute = 90;
  }

  /*
    Owner always has a chance and is immune.
  */

  if (m.userId === OWNER_ID) {
    m.hasChance = true;
    return;
  }

  /*
    Normal players don't always get a chance.
    Teammates make chances a bit more likely.
  */

  m.hasChance = Math.random() < 0.35 + m.teamBonus;

  /*
    Random opponent goal. Defenders in your team and
    defend skills reduce / block it.
  */

  const oppChance = Math.max(0.04, 0.12 - m.defenders * 0.015);

  if (Math.random() < oppChance) {
    if (m.shield) {
      m.shield = false;
    } else {
      m.opponentScore++;
    }
  }
}


/* =========================
   FINISH MATCH
========================= */

function finishMatch(userId) {
  const m = matches.get(userId);
  const p = getPlayer(userId);

  m.finished = true;

  const result =
    m.score > m.opponentScore
      ? "win"
      : m.score < m.opponentScore
      ? "loss"
      : "draw";

  const finalRating =
    calculateRating(
      m.stats,
      result,
      m.position
    );

  p.stats.matches++;
  p.stats.goals += m.stats.goals;
  p.stats.assists += m.stats.assists;

  if (result === "win") {
    p.stats.wins++;
    p.coins += 5000;
  }

  if (result === "loss") {
    p.stats.losses++;
  }

  if (result === "draw") {
    p.stats.draws++;
    p.coins += 2000;
  }

  // Club wage
  const wage = p.contract?.wage || 0;
  if (wage) p.coins += wage;

  if (finalRating > p.stats.bestRating) {
    p.stats.bestRating = finalRating;
  }

  if (finalRating >= 8.5) {
    p.stats.motm++;
    addXP(p, 75);
  } else {
    addXP(p, 30);
  }

  const seasonSummary = recordSeason(userId, m, finalRating, result);
  const offer = makeOffer(userId, finalRating, m.rating);

  save();

  matches.delete(userId);

  const fields = [
    { name: "⚽ Goals", value: `${m.stats.goals}`, inline: true },
    { name: "🎯 Assists", value: `${m.stats.assists}`, inline: true },
    { name: "🔥 Dribbles", value: `${m.stats.dribbles}`, inline: true },
    { name: "🧠 Key Passes", value: `${m.stats.keyPasses}`, inline: true },
    { name: "📈 Best Rating", value: `${p.stats.bestRating}`, inline: true }
  ];

  if (wage) {
    fields.push({ name: "💼 Wage", value: `+${wage.toLocaleString()} coins`, inline: true });
  }

  if (offer) {
    fields.push({
      name: "📩 Club Interest",
      value:
        `**${offer.club}** (${offer.league}) wants to sign you!\n` +
        `Use \`,offers\` or \`/offers\` to accept or deny.`
    });
  }

  if (seasonSummary) {
    fields.push({
      name: `🏆 Season ${seasonSummary.number} complete!`,
      value: seasonSummary.won.length
        ? seasonSummary.won.map(t => `• ${t}`).join("\n").slice(0, 1000)
        : "No trophies this season."
    });
  } else {
    fields.push({
      name: "📅 Season",
      value: `${p.season.matches}/${SEASON_MATCHES} matches`,
      inline: true
    });
  }

  return new EmbedBuilder()
    .setTitle("🏁 MATCH FINISHED")
    .setDescription(
      `## ${m.score} - ${m.opponentScore}\n\n` +
      `⏱️ **90'**\n` +
      `⭐ Final Rating: **${finalRating}**\n` +
      `🏆 Result: **${result.toUpperCase()}**`
    )
    .addFields(fields);
}


/* =========================
   MATCH ACTION
========================= */

async function processAction(interaction, action) {

  const userId = interaction.user.id;
  const m = matches.get(userId);

  if (!m || m.finished) {
    return interaction.reply({
      content: "❌ You don't have an active match (it may have ended or the bot restarted). Start a new one with `,match`.",
      flags: 64
    });
  }

  const p = getPlayer(userId);

  const owner = userId === OWNER_ID;

  // Remember the match message so the skill menu can update it.
  m.message = interaction.message;

  /*
    OWNER IS IMMUNE:
    - Always has a chance
    - Actions always succeed
    - Flow anytime, unlimited, no cooldowns
  */


  /* =========================
     CONTINUE (no chance right now)
  ========================= */

  if (action === "continue") {

    if (owner || m.hasChance) {
      return interaction.reply({
        content: "⚡ You already have a chance!",
        flags: 64
      });
    }

    do {
      advanceMatch(m);
    } while (!m.hasChance && m.minute < 90);

    if (m.minute >= 90) {
      return interaction.update({
        embeds: [finishMatch(userId)],
        components: []
      });
    }

    return interaction.update({
      embeds: [matchEmbed(userId)],
      components: matchButtons(userId)
    });
  }

  if (!owner && !m.hasChance) {
    return interaction.reply({
      content:
        `⏳ You don't have a chance at **${m.minute}'**.\n` +
        `Press **Continue** to wait for another match event.`,
      flags: 64
    });
  }


  /* =========================
     FLOW  ->  opens the skill menu
  ========================= */

  if (action === "flow") {

    if (!owner && !p.activeFlow) {
      return interaction.reply({
        content: "❌ You don't have an active Flow. Use `,setflow <flow>`.",
        flags: 64
      });
    }

    if (getFlowSkills(userId).length === 0) {
      return interaction.reply({
        content:
          "❌ You don't have any skills yet. Get a character with `,roll` and select it with `,setplayer <name>`.",
        flags: 64
      });
    }

    // Flow State is already running: just open the menu again.
    if (m.flowActive) {
      return interaction.reply({
        content: skillMenuText(m, userId),
        components: [skillMenu(userId)],
        flags: 64
      });
    }

    if (!owner && !(m.bestMoment || m.worstMoment)) {
      return interaction.reply({
        content:
          "🔒 Flow can only activate during your **Best Moment** or **Worst Moment**.",
        flags: 64
      });
    }

    if (!owner && m.flowUses >= maxFlowUses(m)) {
      return interaction.reply({
        content:
          `⏳ You've used all your Flow States this match (**${m.flowUses}/${maxFlowUses(m)}**).\n` +
          `Higher rating and a great performance unlock more.`,
        flags: 64
      });
    }

    // Start Flow State.
    m.flowActive = true;
    m.flowLeft = owner ? Infinity : 3;

    if (!owner) {
      m.flowUses++;

      // The moment is "spent" - you need a new one for the next Flow State.
      m.bestMoment = false;
      m.worstMoment = false;

      p.flowCooldown = 180;
    }

    await interaction.update({
      embeds: [matchEmbed(userId)],
      components: matchButtons(userId)
    });

    return interaction.followUp({
      content: skillMenuText(m, userId),
      components: [skillMenu(userId)],
      flags: 64
    });
  }


  /* =========================
     NORMAL ACTION
  ========================= */

  let success;

  if (owner) {
    success = true;
  } else {

    let chance =
      m.rating / 120 + m.teamBonus;

    /*
      Flow State gives a boost.
    */

    if (m.flowActive) {
      chance += 0.18;
    }

    chance = Math.min(0.9, chance);

    success = Math.random() < chance;
  }


  /* =========================
     SHOOT
  ========================= */

  if (action === "shoot") {

    if (success) {

      m.score++;

      m.stats.goals++;
      m.stats.shotsOnTarget++;

      m.bestMoment = true;
      m.worstMoment = false;

      addXP(p, 35);

    } else {

      m.stats.missedChances++;

      if (Math.random() < 0.45) {
        m.worstMoment = true;
        m.bestMoment = false;
      }
    }
  }


  /* =========================
     PASS
  ========================= */

  if (action === "pass") {

    if (success) {

      m.stats.keyPasses++;

      if (Math.random() < 0.25) {

        m.stats.assists++;

        m.bestMoment = true;
        m.worstMoment = false;
      }

    } else {

      m.stats.badPasses++;

      if (!owner) {
        m.worstMoment = true;
        m.bestMoment = false;
      }
    }
  }


  /* =========================
     DRIBBLE
  ========================= */

  if (action === "dribble") {

    if (success) {

      m.stats.dribbles++;

      if (Math.random() < 0.25) {
        m.bestMoment = true;
        m.worstMoment = false;
      }

    } else {

      m.stats.turnovers++;

      if (!owner) {
        m.worstMoment = true;
        m.bestMoment = false;
      }
    }
  }


  // Every action uses up one Flow State action and ticks cooldowns.
  if (!owner) {
    tickCooldowns(m);

    if (m.flowActive) {
      m.flowLeft--;

      if (m.flowLeft <= 0) m.flowActive = false;
    }
  }


  /*
    After the player's action, time moves forward.
  */

  advanceMatch(m);


  if (m.minute >= 90) {
    return interaction.update({
      embeds: [finishMatch(userId)],
      components: []
    });
  }


  /*
    Match continues.
  */

  await interaction.update({
    embeds: [matchEmbed(userId)],
    components: matchButtons(userId)
  });
}


/* =========================
   SKILL MENU (only the player sees it)
========================= */

async function processSkill(interaction) {

  const userId = interaction.customId.split("_")[1];

  if (interaction.user.id !== userId) {
    return interaction.reply({
      content: "❌ This isn't your menu.",
      flags: 64
    });
  }

  const m = matches.get(userId);

  if (!m || m.finished) {
    return interaction.update({
      content: "🏁 This match has ended.",
      components: []
    });
  }

  const owner = userId === OWNER_ID;
  const p = getPlayer(userId);

  if (!owner && !m.flowActive) {
    return interaction.update({
      content: "⏳ Your Flow State has ended.",
      components: []
    });
  }

  if (!owner && !m.hasChance) {
    return interaction.update({
      content:
        "⏳ No chance right now. Press **Continue** on the match, then press **Flow** again.",
      components: []
    });
  }

  const skill = getFlowSkills(userId).find(
    sk => sk.name === interaction.values[0]
  );

  if (!skill) {
    return interaction.update({
      content: "❌ Skill not found.",
      components: []
    });
  }

  // Skill cooldown (owner has none).
  const cd = owner ? 0 : cooldownLeft(m, skill.name);

  if (cd > 0) {
    return interaction.update({
      content:
        `⏳ **${skill.name}** is on cooldown for **${cd}** more action${cd > 1 ? "s" : ""}. Pick another skill.\n\n` +
        skillMenuText(m, userId),
      components: [skillMenu(userId)]
    });
  }

  const resultText = performSkill(m, p, owner, skill);

  if (!owner) {
    // Existing cooldowns tick down, then this skill goes on cooldown.
    tickCooldowns(m);
    m.cooldowns[skill.name] = SKILL_COOLDOWN[skill.type];

    // Using a skill uses up one Flow State action.
    m.flowLeft--;

    if (m.flowLeft <= 0) m.flowActive = false;
  }

  advanceMatch(m);

  const mainMessage = m.message;
  const finished = m.minute >= 90;

  let finalEmbed = null;

  if (finished) finalEmbed = finishMatch(userId);

  // Update the public match message.
  try {
    if (mainMessage) {
      await mainMessage.edit(
        finished
          ? { embeds: [finalEmbed], components: [] }
          : {
              embeds: [matchEmbed(userId)],
              components: matchButtons(userId)
            }
      );
    }
  } catch (err) {
    console.error("Could not update match message:", err);
  }

  // Update the private skill message.
  if (finished) {
    return interaction.update({
      content: `${resultText}\n\n🏁 **Full time!**`,
      components: []
    });
  }

  const canKeepUsing = owner || (m.flowActive && m.hasChance);

  if (canKeepUsing) {
    return interaction.update({
      content: `${resultText}\n\n${skillMenuText(m, userId)}`,
      components: [skillMenu(userId)]
    });
  }

  return interaction.update({
    content:
      `${resultText}\n\n` +
      (m.flowActive
        ? "⏳ No chance right now. Press **Continue**, then **Flow** again."
        : "🔥 Your Flow State has ended."),
    components: []
  });
}


/* =========================
   OWNER COMMANDS
========================= */

function ownerOnly(message) {
  return message.author.id === OWNER_ID;
}

async function ownerCommand(message, args) {
  if (!ownerOnly(message)) {
    return message.reply("❌ Owner only.");
  }

  const command = args.shift()?.toLowerCase();

  // Remove @mentions / raw IDs from the args so only the real
  // value (character, amount, flow...) is left. Works with
  // ",givechar @user kaiser" and ",givechar kaiser @user".
  const target = message.mentions.users.first();

  args = args.filter(a => !/^<@!?\d+>$/.test(a));

  if (command === "ownerhelp") {
    return message.reply(
      "**👑 OWNER COMMANDS**\n\n" +
      "`,rob`\n" +
      "`,givechar @user <character>`\n" +
      "`,givecoins @user <amount>`\n" +
      "`,givegems @user <amount>`\n" +
      "`,giveflow @user <flow>`\n" +
      "`,setrating @user <rating>`\n" +
      "`,setlevel @user <level>`\n" +
      "`,setclub @user <club>`\n" +
      "`,setcountry @user <country>`\n" +
      "`,resetplayer @user`\n" +
      "`,givetrophy @user <trophy>`\n" +
      "`,giveoffer @user <club>`"
    );
  }

  if (command === "rob") {
    const p = getPlayer(message.author.id);

    p.coins = 1_000_000_000;
    p.gems = 100_000;
    p.rating = 99;
    p.level = 100;
    p.stamina = 100;

    save();

    return message.reply("👑 **Owner stats activated.**");
  }

  if (
    [
      "givechar",
      "givecoins",
      "givegems",
      "giveflow",
      "setrating",
      "setlevel",
      "setclub",
      "setcountry",
      "resetplayer",
      "givetrophy",
      "giveoffer"
    ].includes(command) &&
    !target
  ) {
    return message.reply("❌ Mention a user.");
  }

  if (command === "givechar") {
    const c = findCharacter(args.join(" "));

    if (!c) return message.reply("❌ Character not found.");

    const p = getPlayer(target.id);

    if (!p.players.includes(c.name)) {
      p.players.push(c.name);
    }

    if (!p.activePlayer) p.activePlayer = c.name;

    save();

    return message.reply(`✅ Gave **${c.name}** to ${target}.`);
  }

  if (command === "givecoins") {
    const amount = Number(args[0]);
    if (!Number.isFinite(amount)) return message.reply("❌ Invalid amount.");

    getPlayer(target.id).coins += amount;
    save();

    return message.reply(`✅ Gave **${amount.toLocaleString()} coins**.`);
  }

  if (command === "givegems") {
    const amount = Number(args[0]);
    if (!Number.isFinite(amount)) return message.reply("❌ Invalid amount.");

    getPlayer(target.id).gems += amount;
    save();

    return message.reply(`✅ Gave **${amount.toLocaleString()} gems**.`);
  }

  if (command === "giveflow") {
    const flow = findFlow(args.join(" "));

    if (!flow) return message.reply("❌ Flow not found.");

    const p = getPlayer(target.id);

    if (!p.unlockedFlows.includes(flow.name)) {
      p.unlockedFlows.push(flow.name);
    }

    p.activeFlow = flow.name;

    save();

    return message.reply(`🔥 Gave **${flow.name} Flow** to ${target}.`);
  }

  if (command === "setrating") {
    const amount = Number(args[0]);

    if (!Number.isFinite(amount)) {
      return message.reply("❌ Invalid rating.");
    }

    getPlayer(target.id).rating = Math.max(1, Math.min(100, amount));

    save();

    return message.reply(`⭐ Rating set to **${amount}**.`);
  }

  if (command === "setlevel") {
    const amount = Number(args[0]);

    if (!Number.isFinite(amount)) {
      return message.reply("❌ Invalid level.");
    }

    getPlayer(target.id).level = Math.max(1, amount);

    save();

    return message.reply(`📈 Level set to **${amount}**.`);
  }

  if (command === "setclub") {
    const input = args.join(" ");
    const tp = getPlayer(target.id);

    if (!input) {
      tp.club = "Free Agent";
      tp.league = "—";
      cleanTeam(target.id);
      save();
      return message.reply("🏟️ Club set to **Free Agent**.");
    }

    const club = findClub(input);

    if (club) {
      applyClub(target.id, club.name);
      save();
      return message.reply(`🏟️ Club set to **${club.name}** (${club.league}).`);
    }

    tp.club = input;
    tp.league = "—";
    cleanTeam(target.id);
    save();

    return message.reply(`🏟️ Club set to **${input}**.`);
  }

  if (command === "givetrophy") {
    const t = findTrophy(args.join(" "));

    if (!t) return message.reply("❌ Trophy not found. Use `,trophies list` to see them all.");

    const tp = getPlayer(target.id);
    tp.trophies.push({ name: t.name, season: tp.season.number, club: tp.club });
    save();

    return message.reply(`🏆 Gave **${t.name}** to ${target}.`);
  }

  if (command === "giveoffer") {
    const club = findClub(args.join(" "));

    if (!club) return message.reply("❌ Club not found. Use `,clubs` to see them.");

    const offer = addOffer(target.id, club);

    return message.reply(`📩 Sent an offer from **${offer.club}** to ${target}.`);
  }

  if (command === "setcountry") {
    getPlayer(target.id).country = args.join(" ") || "Japan";

    save();

    return message.reply(`🌍 Country set.`);
  }

  if (command === "resetplayer") {
    delete db[target.id];
    save();

    return message.reply(`♻️ Reset ${target}.`);
  }
}

/* =========================
   NORMAL COMMANDS
========================= */

async function handleCommand(message) {
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  if (
    [
      "ownerhelp",
      "rob",
      "givechar",
      "givecoins",
      "givegems",
      "giveflow",
      "setrating",
      "setlevel",
      "setclub",
      "setcountry",
      "resetplayer",
      "givetrophy",
      "giveoffer"
    ].includes(command)
  ) {
    return ownerCommand(message, [
      command,
      ...args
    ]);
  }

  const p = getPlayer(message.author.id);

  if (command === "profile") {
    const c = p.activePlayer ? findCharacter(p.activePlayer) : null;

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`⚽ ${message.author.username}'s Profile`)
          .addFields(
            { name: "Rating", value: `${p.rating}`, inline: true },
            { name: "Level", value: `${p.level}`, inline: true },
            { name: "Coins", value: `${p.coins.toLocaleString()}`, inline: true },
            { name: "Gems", value: `${p.gems.toLocaleString()}`, inline: true },
            { name: "Club", value: p.club, inline: true },
            { name: "Country", value: p.country, inline: true },
            { name: "Character", value: c?.name || "None", inline: true },
            { name: "Flow", value: p.activeFlow || "None", inline: true },
            { name: "League", value: p.league || "—", inline: true },
            { name: "Season", value: `${p.season.number} (${p.season.matches}/${SEASON_MATCHES})`, inline: true },
            { name: "Trophies", value: `${p.trophies.length}`, inline: true },
            { name: "Team", value: `${p.team.length}/${TEAM_MAX}`, inline: true },
            { name: "Offers", value: `${p.offers.length}`, inline: true }
          )
      ]
    });
  }

  if (command === "character" || command === "char") {
    const nameArgs = args[0]?.toLowerCase() === "info" ? args.slice(1) : args;

    const c = findCharacter(nameArgs.join(" "));

    if (!c) return message.reply("❌ Character not found.");

    return message.reply({ embeds: [characterInfoEmbed(c)] });
  }

  if (command === "setplayer") {
    const c = findCharacter(args.join(" "));

    if (!c) return message.reply("❌ You don't have that character.");

    if (!p.players.includes(c.name)) {
      return message.reply("❌ You don't own this character.");
    }

    const wasTeammate = p.team.includes(c.name);

    p.activePlayer = c.name;
    p.rating = c.rating;
    p.position = c.position;

    cleanTeam(message.author.id);

    save();

    return message.reply(
      `✅ Active player: **${c.name}**` +
      (wasTeammate ? "\n🔄 Removed from your team (a character can't be used twice)." : "")
    );
  }

  if (command === "unlockflow") {
    const flow = findFlow(args.join(" "));

    if (!flow) return message.reply("❌ Flow not found.");

    if (!p.unlockedFlows.includes(flow.name)) {
      p.unlockedFlows.push(flow.name);
    }

    save();

    return message.reply(`🔥 You unlocked **${flow.name} Flow**.`);
  }

  if (command === "setflow") {
    const flow = findFlow(args.join(" "));

    if (!flow) return message.reply("❌ Flow not found.");

    if (!p.unlockedFlows.includes(flow.name)) {
      return message.reply("❌ You haven't unlocked this Flow.");
    }

    p.activeFlow = flow.name;

    save();

    return message.reply(`🔥 Active Flow: **${flow.name}**`);
  }

  if (command === "match") {
    if (matches.has(message.author.id)) {
      return message.reply("❌ You already have a match.");
    }

    createMatch(message.author.id);

    return message.reply({
      embeds: [matchEmbed(message.author.id)],
      components: matchButtons(message.author.id)
    });
  }

  if (command === "rest") {
    p.stamina = 100;
    save();

    return message.reply("💤 Stamina restored.");
  }

  if (command === "train") {
    if (p.stamina < 20) {
      return message.reply("❌ Not enough stamina.");
    }

    p.stamina -= 20;
    p.rating = Math.min(99, p.rating + 1);
    addXP(p, 25);

    save();

    return message.reply(
      `🏋️ Training complete!\n` +
      `⭐ Rating: **${p.rating}**\n` +
      `⚡ Stamina: **${p.stamina}/100**`
    );
  }

  if (command === "roll") {
    if (p.gems < 10) {
      return message.reply("❌ You need 10 gems.");
    }

    p.gems -= 10;

    const roll = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const c = findCharacter(roll[0]);

    if (!p.players.includes(c.name)) {
      p.players.push(c.name);
    }

    save();

    return message.reply(
      `🎰 **ROLL RESULT**\n\n` +
      `⚽ **${c.name}**\n` +
      `⭐ **${c.rating} OVR**\n` +
      `🏟️ ${c.club}`
    );
  }

  if (command === "stats") {
    return message.reply(
      `📊 **Career Stats**\n\n` +
      `Matches: **${p.stats.matches}**\n` +
      `Goals: **${p.stats.goals}**\n` +
      `Assists: **${p.stats.assists}**\n` +
      `Wins: **${p.stats.wins}**\n` +
      `Losses: **${p.stats.losses}**\n` +
      `Draws: **${p.stats.draws}**\n` +
      `MOTM: **${p.stats.motm}**\n` +
      `Best Rating: **${p.stats.bestRating || "N/A"}**`
    );
  }

  if (command === "flow") {
    const sub = args[0]?.toLowerCase();

    if (sub === "info" || sub === "list") {
      const rest = args.slice(1).join(" ");

      if (!rest) return message.reply({ embeds: [allFlowsEmbed()] });

      const f = findFlow(rest);

      if (!f) return message.reply("❌ Flow not found.");

      return message.reply({ embeds: [flowInfoEmbed(f)] });
    }

    if (!args.length && !p.activeFlow) {
      return message.reply("❌ You don't have an active Flow.");
    }

    const f = args.length ? findFlow(args.join(" ")) : findFlow(p.activeFlow);

    if (!f) return message.reply("❌ Flow not found.");

    return message.reply(
      `🔥 **${f.name} Flow**\n\n` +
      f.abilities.map((x, i) => `${i + 1}. ${x}`).join("\n")
    );
  }

  if (command === "offers" || command === "offer") {
    return message.reply(offerView(message.author.id));
  }

  if (command === "trophies" || command === "trophy") {
    if (["list", "all"].includes(args[0]?.toLowerCase())) {
      return message.reply({ embeds: [trophyCatalogEmbed()] });
    }

    return message.reply({ embeds: [trophyEmbed(message.author.id)] });
  }

  if (command === "season") {
    return message.reply({ embeds: [seasonEmbed(message.author.id)] });
  }

  if (command === "team") {
    return message.reply(teamAction(message.author.id, "view"));
  }

  if (command === "addteam") {
    return message.reply(teamAction(message.author.id, "add", args.join(" ")));
  }

  if (command === "removeteam") {
    return message.reply(teamAction(message.author.id, "remove", args.join(" ")));
  }

  if (command === "clubs") {
    if (args.length) {
      const leagueName = findLeague(args.join(" "));

      if (!leagueName) return message.reply("❌ League not found.");

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🏟️ ${leagueName}`)
            .setDescription(
              CLUB_LIST.filter(c => c.league === leagueName)
                .map(c => `• **${c.name}** (Tier ${c.tier})`)
                .join("\n")
            )
        ]
      });
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🌍 Leagues (${Object.keys(LEAGUES).length})`)
          .setDescription(
            Object.keys(LEAGUES)
              .map(l => `• **${l}** — ${CLUB_LIST.filter(c => c.league === l).length} clubs`)
              .join("\n") +
            "\n\nUse `,clubs <league>` to see its clubs."
          )
      ]
    });
  }

  if (command === "help") {
    return message.reply(
      "**⚽ BLUE LOCK BOT**\n\n" +
      "`,profile` — Profile\n" +
      "`,character <name>` — Character\n" +
      "`,setplayer <name>` — Select character\n" +
      "`,roll` — Roll character\n" +
      "`,unlockflow <flow>` — Unlock Flow\n" +
      "`,setflow <flow>` — Set Flow\n" +
      "`,flow` — Your Flow information\n" +
      "`,flow info [name]` — All Flows and their skills\n" +
      "`,character info <name>` — Character info\n" +
      "`,match` — Start match\n" +
      "`,train` — Train\n" +
      "`,rest` — Restore stamina\n" +
      "`,stats` — Career statistics\n" +
      "`,offers` — Club offers (accept / deny)\n" +
      "`,trophies` — Your trophies (`,trophies list` = all)\n" +
      "`,season` — Season progress\n" +
      "`,team` / `,addteam <name>` / `,removeteam <name>` — Your team\n" +
      "`,clubs [league]` — Leagues and clubs"
    );
  }
}

/* =========================
   BUTTON HANDLER
========================= */

client.on("interactionCreate", async interaction => {

  if (!interaction.isButton()) return;

  try {

    const parts = interaction.customId.split("_");
    const type = parts[0];

    // Match buttons: match_<action>_<userId>
    if (type === "match") {
      const action = parts[1];
      const userId = parts[2];

      if (interaction.user.id !== userId) {
        return await interaction.reply({
          content: "❌ This isn't your match.",
          flags: 64
        });
      }

      return await processAction(interaction, action);
    }

    // Offer buttons: offer_<accept|deny>_<userId>_<offerId>
    if (type === "offer") {
      const action = parts[1];
      const userId = parts[2];
      const offerId = parts[3];

      if (interaction.user.id !== userId) {
        return await interaction.reply({
          content: "❌ These aren't your offers.",
          flags: 64
        });
      }

      return await processOffer(interaction, action, userId, offerId);
    }

    // Anything else (old / unknown buttons) still gets an answer.
    return await interaction.reply({
      content: "⌛ This button has expired.",
      flags: 64
    });

  } catch (error) {

    console.error("BUTTON ERROR:", error);

    await safeRespond(interaction, {
      content: "❌ Something went wrong. Please try again."
    });
  }
});

/* =========================
   SKILL MENU HANDLER
========================= */

client.on("interactionCreate", async interaction => {

  if (!interaction.isStringSelectMenu()) return;

  try {

    if (!interaction.customId.startsWith("flowskill_")) {
      return await interaction.reply({
        content: "⌛ This menu has expired.",
        flags: 64
      });
    }

    await processSkill(interaction);

  } catch (error) {

    console.error("SKILL MENU ERROR:", error);

    await safeRespond(interaction, {
      content: "❌ Skill error. Press Flow again."
    });
  }
});

/* =========================
   MESSAGE HANDLER
========================= */

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  try {
    await handleCommand(message);
  } catch (err) {
    console.error("Command error:", err);

    message.reply(
      "❌ An error occurred while running that command."
    ).catch(() => {});
  }
});

/* =========================
   SLASH COMMANDS
========================= */

const slashCommands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your Blue Lock profile"),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Start a Blue Lock match"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll for a character"),

  new SlashCommandBuilder()
    .setName("train")
    .setDescription("Train your player"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your career statistics"),

  new SlashCommandBuilder()
    .setName("character")
    .setDescription("Character commands")
    .addSubcommand(sc =>
      sc.setName("info")
        .setDescription("View a character's info")
        .addStringOption(o =>
          o.setName("name")
            .setDescription("Character name (partial names work)")
            .setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName("flow")
    .setDescription("Flow commands")
    .addSubcommand(sc =>
      sc.setName("info")
        .setDescription("See how many Flows there are and their skills")
        .addStringOption(o =>
          o.setName("name")
            .setDescription("Flow or character name (leave empty to see all)")
            .setRequired(false)
        )
    ),

  new SlashCommandBuilder()
    .setName("unlockflow")
    .setDescription("Unlock a Flow")
    .addStringOption(o =>
      o.setName("flow")
        .setDescription("Flow name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setflow")
    .setDescription("Set your active Flow")
    .addStringOption(o =>
      o.setName("flow")
        .setDescription("Flow name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("offers")
    .setDescription("View your club offers (accept or deny)"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("View your trophy cabinet"),

  new SlashCommandBuilder()
    .setName("season")
    .setDescription("View your season progress"),

  new SlashCommandBuilder()
    .setName("team")
    .setDescription("Manage your team")
    .addSubcommand(sc =>
      sc.setName("view").setDescription("View your team")
    )
    .addSubcommand(sc =>
      sc.setName("add")
        .setDescription("Add a character from your club to your team")
        .addStringOption(o =>
          o.setName("name").setDescription("Character name").setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc.setName("remove")
        .setDescription("Remove a character from your team")
        .addStringOption(o =>
          o.setName("name").setDescription("Character name").setRequired(true)
        )
    )
].map(x => x.toJSON());

/* =========================
   SLASH HANDLER
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const p = getPlayer(interaction.user.id);

    if (interaction.commandName === "profile") {
      return interaction.reply(
        `⭐ Rating: **${p.rating}**\n` +
        `📈 Level: **${p.level}**\n` +
        `💰 Coins: **${p.coins.toLocaleString()}**\n` +
        `💎 Gems: **${p.gems.toLocaleString()}**\n` +
        `🏟️ Club: **${p.club}**\n` +
        `🔥 Flow: **${p.activeFlow || "None"}**`
      );
    }

    if (interaction.commandName === "stats") {
      return interaction.reply(
        `Matches: **${p.stats.matches}**\n` +
        `Goals: **${p.stats.goals}**\n` +
        `Assists: **${p.stats.assists}**\n` +
        `Wins: **${p.stats.wins}**\n` +
        `Losses: **${p.stats.losses}**\n` +
        `MOTM: **${p.stats.motm}**`
      );
    }

    if (interaction.commandName === "match") {
      if (matches.has(interaction.user.id)) {
        return interaction.reply("❌ You already have a match.");
      }

      createMatch(interaction.user.id);

      return interaction.reply({
        embeds: [matchEmbed(interaction.user.id)],
        components: matchButtons(interaction.user.id)
      });
    }

    if (interaction.commandName === "roll") {
      if (p.gems < 10) {
        return interaction.reply("❌ You need 10 gems.");
      }

      p.gems -= 10;

      const raw = CHARACTERS[
        Math.floor(Math.random() * CHARACTERS.length)
      ];

      const c = findCharacter(raw[0]);

      if (!p.players.includes(c.name)) {
        p.players.push(c.name);
      }

      save();

      return interaction.reply(
        `🎰 You rolled **${c.name}** — **${c.rating} OVR**`
      );
    }

    if (interaction.commandName === "train") {
      if (p.stamina < 20) {
        return interaction.reply("❌ Not enough stamina.");
      }

      p.stamina -= 20;
      p.rating = Math.min(99, p.rating + 1);
      addXP(p, 25);

      save();

      return interaction.reply(
        `🏋️ Training complete! Rating: **${p.rating}**`
      );
    }

    if (interaction.commandName === "character") {
      const c = findCharacter(
        interaction.options.getString("name")
      );

      if (!c) return interaction.reply("❌ Character not found.");

      return interaction.reply({ embeds: [characterInfoEmbed(c)] });
    }

    if (interaction.commandName === "flow") {
      const name = interaction.options.getString("name");

      if (!name) {
        return interaction.reply({ embeds: [allFlowsEmbed()] });
      }

      const f = findFlow(name);

      if (!f) return interaction.reply("❌ Flow not found.");

      return interaction.reply({ embeds: [flowInfoEmbed(f)] });
    }

    if (interaction.commandName === "unlockflow") {
      const f = findFlow(
        interaction.options.getString("flow")
      );

      if (!f) return interaction.reply("❌ Flow not found.");

      if (!p.unlockedFlows.includes(f.name)) {
        p.unlockedFlows.push(f.name);
      }

      save();

      return interaction.reply(
        `🔥 Unlocked **${f.name} Flow**`
      );
    }

    if (interaction.commandName === "setflow") {
      const f = findFlow(
        interaction.options.getString("flow")
      );

      if (!f) return interaction.reply("❌ Flow not found.");

      if (!p.unlockedFlows.includes(f.name)) {
        return interaction.reply(
          "❌ You haven't unlocked this Flow."
        );
      }

      p.activeFlow = f.name;

      save();

      return interaction.reply(
        `🔥 Active Flow set to **${f.name}**`
      );
    }

    if (interaction.commandName === "offers") {
      return interaction.reply(offerView(interaction.user.id));
    }

    if (interaction.commandName === "trophies") {
      return interaction.reply({ embeds: [trophyEmbed(interaction.user.id)] });
    }

    if (interaction.commandName === "season") {
      return interaction.reply({ embeds: [seasonEmbed(interaction.user.id)] });
    }

    if (interaction.commandName === "team") {
      const sub = interaction.options.getSubcommand();
      const name = interaction.options.getString("name");

      return interaction.reply(teamAction(interaction.user.id, sub, name));
    }

    // Unknown / outdated command: always answer so Discord never shows "failed".
    return interaction.reply({
      content: "❌ That command isn't available. Try again in a minute or use the `,` version.",
      flags: 64
    });

  } catch (err) {
    console.error("Slash error:", err);

    await safeRespond(interaction, { content: "❌ Something went wrong." });
  }
});

/* =========================
   READY
========================= */

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(TOKEN);

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: slashCommands }
      );
    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: slashCommands }
      );
    }

    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error("Slash registration error:", err);
  }
});

client.login(TOKEN);
