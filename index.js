const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ==============================
// CONFIG
// ==============================

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = ",";

const OWNER_ID = "1547542814525493269";

if (!TOKEN) {
  console.error("Missing DISCORD_TOKEN in Railway variables.");
  process.exit(1);
}

// ==============================
// CLIENT
// ==============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// DATABASE
// ==============================

const DATA_FOLDER = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_FOLDER, "database.json");

if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER);
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      {
        players: {},
        trades: {},
        events: {},
        matches: {},
        meta: {
          matchId: 1,
          tradeId: 1,
          eventId: 1
        }
      },
      null,
      2
    )
  );
}

let db;

try {
  db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} catch {
  db = {
    players: {},
    trades: {},
    events: {},
    matches: {},
    meta: {
      matchId: 1,
      tradeId: 1,
      eventId: 1
    }
  };
}

function saveDatabase() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(db, null, 2)
  );
}

// ==============================
// COLORS
// ==============================

const COLORS = {
  BLUE: 0x3498db,
  GREEN: 0x2ecc71,
  RED: 0xe74c3c,
  GOLD: 0xf1c40f,
  PURPLE: 0x9b59b6,
  ORANGE: 0xe67e22,
  DARK: 0x171717
};

// ==============================
// RARITIES
// ==============================

const RARITIES = {
  Common: {
    chance: 50,
    color: 0x95a5a6
  },

  Uncommon: {
    chance: 25,
    color: 0x2ecc71
  },

  Rare: {
    chance: 13,
    color: 0x3498db
  },

  Epic: {
    chance: 7,
    color: 0x9b59b6
  },

  Legendary: {
    chance: 3.5,
    color: 0xf1c40f
  },

  Mythic: {
    chance: 1.2,
    color: 0xe67e22
  },

  Secret: {
    chance: 0.3,
    color: 0xe74c3c
  }
};

// ==============================
// STATS
// ==============================

const STATS = [
  "Shooting",
  "Passing",
  "Dribbling",
  "Speed",
  "Defense",
  "Physical",
  "Vision",
  "Technique",
  "Positioning",
  "Ego"
];

const POSITIONS = [
  "ST",
  "CF",
  "LW",
  "RW",
  "CAM",
  "CM",
  "CDM",
  "LB",
  "RB",
  "CB",
  "GK"
];

// ==============================
// CLUBS
// ==============================

const CLUBS = [
  "Bastard München",
  "Paris X Gen",
  "Manshine City",
  "FC Barcha",
  "Ubers",
  "Blue Lock",
  "Japan U-20"
];

// ==============================
// COUNTRIES
// ==============================

const COUNTRIES = [
  "Japan",
  "Germany",
  "France",
  "England",
  "Spain",
  "Italy",
  "Brazil",
  "Argentina",
  "Portugal",
  "USA"
];

// ==============================
// CHARACTERS
// ==============================

const CHARACTERS = {

  isagi: {
    name: "Isagi Yoichi",
    rarity: "Mythic",
    rating: 96,
    position: "ST",
    club: "Bastard München",
    country: "Japan",

    stats: {
      Shooting: 94,
      Passing: 91,
      Dribbling: 89,
      Speed: 87,
      Defense: 72,
      Physical: 76,
      Vision: 99,
      Technique: 92,
      Positioning: 99,
      Ego: 100
    },

    skills: [
      {
        name: "Meta Vision",
        type: "Signature",
        rarity: "Mythic",
        description:
          "Reads the field and massively improves positioning and passing."
      },

      {
        name: "Spatial Awareness",
        type: "Secondary",
        rarity: "Epic",
        description:
          "Improves positioning and interception prediction."
      },

      {
        name: "Direct Shot",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Increases finishing immediately after receiving a pass."
      },

      {
        name: "Off-Ball Movement",
        type: "Secondary",
        rarity: "Epic",
        description:
          "Creates additional attacking opportunities without possession."
      },

      {
        name: "Adaptation",
        type: "Secondary",
        rarity: "Mythic",
        description:
          "Becomes stronger as the player reads the opponent."
      },

      {
        name: "Predator Positioning",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Improves finishing from dangerous positions."
      },

      {
        name: "Ego Evolution",
        type: "Ultimate",
        rarity: "Secret",
        description:
          "Activates a powerful temporary all-round boost."
      }
    ]
  },

  kaiser: {
    name: "Michael Kaiser",
    rarity: "Secret",
    rating: 99,
    position: "ST",
    club: "Bastard München",
    country: "Germany",

    stats: {
      Shooting: 100,
      Passing: 94,
      Dribbling: 94,
      Speed: 92,
      Defense: 70,
      Physical: 83,
      Vision: 96,
      Technique: 98,
      Positioning: 98,
      Ego: 100
    },

    skills: [
      {
        name: "Kaiser Impact",
        type: "Signature",
        rarity: "Secret",
        description:
          "Extremely powerful and accurate finishing technique."
      },

      {
        name: "Kaiser Impact: Magnus",
        type: "Secondary",
        rarity: "Secret",
        description:
          "Advanced curved finishing technique."
      },

      {
        name: "Predator Eye",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Improves finishing under defensive pressure."
      },

      {
        name: "Elite Shooting",
        type: "Secondary",
        rarity: "Mythic",
        description:
          "Greatly increases shot accuracy."
      },

      {
        name: "Spatial Positioning",
        type: "Secondary",
        rarity: "Epic",
        description:
          "Improves movement into scoring areas."
      },

      {
        name: "Off-Ball Instinct",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Creates extra shooting opportunities."
      },

      {
        name: "Kaiser Ego",
        type: "Ultimate",
        rarity: "Secret",
        description:
          "Activates an extreme late-match attacking boost."
      }
    ]
  },

  rin: {
    name: "Rin Itoshi",
    rarity: "Mythic",
    rating: 98,
    position: "ST",
    club: "Paris X Gen",
    country: "Japan",

    stats: {
      Shooting: 98,
      Passing: 96,
      Dribbling: 96,
      Speed: 92,
      Defense: 86,
      Physical: 90,
      Vision: 98,
      Technique: 97,
      Positioning: 97,
      Ego: 100
    },

    skills: [
      {
        name: "Destroyer Mode",
        type: "Signature",
        rarity: "Mythic",
        description:
          "Massively increases attacking pressure and defensive intensity."
      },

      {
        name: "Puppet Control",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Improves passing and manipulation of defensive positioning."
      },

      {
        name: "Spatial Awareness",
        type: "Secondary",
        rarity: "Epic",
        description:
          "Improves field awareness."
      },

      {
        name: "Trapping",
        type: "Secondary",
        rarity: "Epic",
        description:
          "Improves first touch."
      },

      {
        name: "Long-Range Shooting",
        type: "Secondary",
        rarity: "Legendary",
        description:
          "Improves shots from distance."
      },

      {
        name: "Prediction",
        type: "Secondary",
        rarity: "Mythic",
        description:
          "Improves defensive reads."
      },

      {
        name: "Destroyer Flow",
        type: "Ultimate",
        rarity: "Secret",
        description:
          "Activates Rin's strongest state."
      }
    ]
  }

};

// ==============================
// PLAYER CREATION
// ==============================

function createPlayer(user) {

  if (db.players[user.id]) {
    return db.players[user.id];
  }

  db.players[user.id] = {

    id: user.id,

    username: user.username,

    coins: 5000,

    gems: 100,

    level: 1,

    xp: 0,

    rating: 75,

    career: "Rookie",

    club: "Blue Lock",

    country: "Japan",

    activeCharacter: "isagi",

    characters: {
      isagi: {
        copies: 1,
        level: 1,
        flow: 0,
        skills: {}
      }
    },

    statistics: {
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,

      goals: 0,
      assists: 0,

      dribbles: 0,
      passes: 0,
      interceptions: 0,
      saves: 0
    },

    trophies: [],

    inventory: {},

    cooldowns: {},

    history: []

  };

  saveDatabase();

  return db.players[user.id];
}

function getPlayer(user) {
  return createPlayer(user);
}

// ==============================
// XP SYSTEM
// ==============================

function requiredXP(level) {
  return Math.floor(
    500 * Math.pow(level, 1.35)
  );
}

function addXP(player, amount) {

  player.xp += amount;

  let levels = 0;

  while (
    player.level < 100 &&
    player.xp >= requiredXP(player.level)
  ) {

    player.xp -= requiredXP(player.level);

    player.level++;

    levels++;
  }

  return levels;
}

// ==============================
// EMBED
// ==============================

function makeEmbed(title, description, color = COLORS.BLUE) {

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

// ==============================
// COMMAND HANDLER
// ==============================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = args.shift().toLowerCase();

  const player = getPlayer(message.author);

  // Commands will continue below.
});
