const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

const PREFIX = ",";
const OWNER_ID = "1547542814525493269";

if (!TOKEN) {
  console.error("❌ Missing DISCORD_TOKEN in Railway Variables.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Missing CLIENT_ID in Railway Variables.");
  process.exit(1);
}

// ======================================================
// CLIENT
// ======================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ======================================================
// DATABASE
// ======================================================

const DATA_FOLDER = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_FOLDER, "database.json");

if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

const defaultDatabase = {
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

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(defaultDatabase, null, 2)
  );
}

let db;

try {
  db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} catch {
  db = structuredClone(defaultDatabase);
}

function saveDatabase() {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error("Database save error:", error);
  }
}

// ======================================================
// COLORS
// ======================================================

const COLORS = {
  BLUE: 0x3498db,
  GREEN: 0x2ecc71,
  RED: 0xe74c3c,
  GOLD: 0xf1c40f,
  PURPLE: 0x9b59b6,
  ORANGE: 0xe67e22,
  CYAN: 0x00ffff,
  DARK: 0x171717
};

// ======================================================
// RARITIES
// ======================================================

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

function rarityColor(rarity) {
  return RARITIES[rarity]?.color || COLORS.BLUE;
}

// ======================================================
// GAME DATA
// ======================================================

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

const CLUBS = [
  "Bastard München",
  "Paris X Gen",
  "Manshine City",
  "FC Barcha",
  "Ubers",
  "Blue Lock",
  "Japan U-20"
];

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

// ======================================================
// CHARACTERS
// ======================================================

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
      ["Meta Vision", "Signature", "Reads the field and improves positioning and passing."],
      ["Spatial Awareness", "Secondary", "Improves positioning and interception prediction."],
      ["Direct Shot", "Secondary", "Improves finishing after receiving a pass."],
      ["Off-Ball Movement", "Secondary", "Creates attacking opportunities without possession."],
      ["Adaptation", "Secondary", "Becomes stronger as the opponent is analyzed."],
      ["Predator Positioning", "Secondary", "Improves finishing from dangerous positions."],
      ["Ego Evolution", "Ultimate", "Activates a temporary all-round boost."]
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
      ["Kaiser Impact", "Signature", "Extremely powerful and accurate finishing."],
      ["Kaiser Impact: Magnus", "Secondary", "Advanced curved finishing technique."],
      ["Predator Eye", "Secondary", "Improves finishing under pressure."],
      ["Elite Shooting", "Secondary", "Greatly increases shot accuracy."],
      ["Spatial Positioning", "Secondary", "Improves movement into scoring areas."],
      ["Off-Ball Instinct", "Secondary", "Creates extra shooting opportunities."],
      ["Kaiser Ego", "Ultimate", "Activates an extreme attacking boost."]
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
      ["Destroyer Mode", "Signature", "Massively increases attacking pressure."],
      ["Puppet Control", "Secondary", "Improves passing and defensive manipulation."],
      ["Spatial Awareness", "Secondary", "Improves field awareness."],
      ["Trapping", "Secondary", "Improves first touch."],
      ["Long-Range Shooting", "Secondary", "Improves distance shooting."],
      ["Prediction", "Secondary", "Improves defensive reads."],
      ["Destroyer Flow", "Ultimate", "Activates Rin's strongest state."]
    ]
  },

  noa: {
    name: "Noel Noa",
    rarity: "Secret",
    rating: 100,
    position: "ST",
    club: "Bastard München",
    country: "France",
    stats: {
      Shooting: 100,
      Passing: 98,
      Dribbling: 96,
      Speed: 97,
      Defense: 90,
      Physical: 98,
      Vision: 99,
      Technique: 99,
      Positioning: 100,
      Ego: 95
    },
    skills: [
      ["Perfect Play", "Signature", "Elite all-round football ability."],
      ["Ambidextrous Finishing", "Secondary", "Allows dangerous finishing from either side."],
      ["World-Class Vision", "Secondary", "Improves passing and positioning."],
      ["Master Striker", "Ultimate", "Massive temporary attacking boost."]
    ]
  },

  loki: {
    name: "Julian Loki",
    rarity: "Mythic",
    rating: 97,
    position: "ST",
    club: "Paris X Gen",
    country: "France",
    stats: {
      Shooting: 95,
      Passing: 89,
      Dribbling: 96,
      Speed: 100,
      Defense: 65,
      Physical: 78,
      Vision: 93,
      Technique: 95,
      Positioning: 94,
      Ego: 98
    },
    skills: [
      ["Lightning Speed", "Signature", "Massively increases movement speed."],
      ["Acceleration", "Secondary", "Explosive first steps."],
      ["Speed Dribble", "Secondary", "Improves dribbling at high speed."],
      ["Lightning Break", "Ultimate", "Temporary maximum-speed state."]
    ]
  },

  lavinho: {
    name: "Lavinho",
    rarity: "Legendary",
    rating: 96,
    position: "LW",
    club: "FC Barcha",
    country: "Brazil",
    stats: {
      Shooting: 93,
      Passing: 91,
      Dribbling: 100,
      Speed: 94,
      Defense: 60,
      Physical: 82,
      Vision: 94,
      Technique: 100,
      Positioning: 91,
      Ego: 97
    },
    skills: [
      ["Brazilian Flair", "Signature", "Massively improves dribbling."],
      ["Elastic Dribble", "Secondary", "Improves one-on-one ability."],
      ["Creative Passing", "Secondary", "Improves attacking passes."],
      ["Dancing Ego", "Ultimate", "Temporary dribbling and technique boost."]
    ]
  },

  bachira: {
    name: "Meguru Bachira",
    rarity: "Legendary",
    rating: 94,
    position: "RW",
    club: "FC Barcha",
    country: "Japan",
    stats: {
      Shooting: 88,
      Passing: 90,
      Dribbling: 100,
      Speed: 92,
      Defense: 62,
      Physical: 75,
      Vision: 95,
      Technique: 98,
      Positioning: 88,
      Ego: 96
    },
    skills: [
      ["Monster", "Signature", "Unlocks unpredictable attacking movement."],
      ["Elastic Dribbling", "Secondary", "Improves one-on-one dribbles."],
      ["Creative Genius", "Secondary", "Improves chance creation."],
      ["Monster Flow", "Ultimate", "Temporary attacking evolution."]
    ]
  },

  barou: {
    name: "Shoei Barou",
    rarity: "Legendary",
    rating: 95,
    position: "ST",
    club: "Ubers",
    country: "Japan",
    stats: {
      Shooting: 98,
      Passing: 70,
      Dribbling: 92,
      Speed: 88,
      Defense: 72,
      Physical: 94,
      Vision: 87,
      Technique: 91,
      Positioning: 95,
      Ego: 100
    },
    skills: [
      ["Predator Eye", "Signature", "Improves finishing in scoring positions."],
      ["Chop Feint", "Secondary", "Improves dribbling past defenders."],
      ["King's Charge", "Secondary", "Boosts physical attacking pressure."],
      ["King's Awakening", "Ultimate", "Massive finishing boost."]
    ]
  },

  nagi: {
    name: "Seishiro Nagi",
    rarity: "Mythic",
    rating: 95,
    position: "CF",
    club: "Manshine City",
    country: "Japan",
    stats: {
      Shooting: 94,
      Passing: 82,
      Dribbling: 90,
      Speed: 84,
      Defense: 60,
      Physical: 88,
      Vision: 90,
      Technique: 100,
      Positioning: 93,
      Ego: 91
    },
    skills: [
      ["Trap", "Signature", "Exceptional first touch."],
      ["Five-Stage Revolver", "Secondary", "Improves complex finishing."],
      ["Ball Control", "Secondary", "Improves difficult receptions."],
      ["Nagi Awakening", "Ultimate", "Temporary technique boost."]
    ]
  },

  reo: {
    name: "Reo Mikage",
    rarity: "Epic",
    rating: 91,
    position: "CM",
    club: "Manshine City",
    country: "Japan",
    stats: {
      Shooting: 82,
      Passing: 94,
      Dribbling: 87,
      Speed: 84,
      Defense: 79,
      Physical: 80,
      Vision: 96,
      Technique: 91,
      Positioning: 90,
      Ego: 88
    },
    skills: [
      ["Chameleon", "Signature", "Copies aspects of other players."],
      ["Versatile Play", "Secondary", "Improves all-round performance."],
      ["Adaptation", "Ultimate", "Temporarily copies an opponent ability."]
    ]
  }
};

// ======================================================
// PLAYER SYSTEM
// ======================================================

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
        flow: 0
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

function characterCount(player) {
  return Object.values(player.characters)
    .reduce((sum, char) => sum + char.copies, 0);
}

// ======================================================
// XP
// ======================================================

function requiredXP(level) {
  return Math.floor(500 * Math.pow(level, 1.35));
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

// ======================================================
// EMBEDS
// ======================================================

function makeEmbed(
  title,
  description,
  color = COLORS.BLUE
) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

// ======================================================
// RARITY ROLL
// ======================================================

function rollRarity() {
  const random = Math.random() * 100;

  let cumulative = 0;

  for (const [rarity, data] of Object.entries(RARITIES)) {
    cumulative += data.chance;

    if (random <= cumulative) {
      return rarity;
    }
  }

  return "Common";
}

function getCharactersByRarity(rarity) {
  return Object.entries(CHARACTERS)
    .filter(([_, char]) => char.rarity === rarity);
}

function rollCharacter() {
  const rarity = rollRarity();

  let pool = getCharactersByRarity(rarity);

  if (!pool.length) {
    pool = Object.entries(CHARACTERS);
  }

  const [id, character] =
    pool[Math.floor(Math.random() * pool.length)];

  return {
    id,
    character
  };
}

// ======================================================
// COOLDOWNS
// ======================================================

function cooldownRemaining(player, command, seconds) {
  const last = player.cooldowns[command] || 0;
  const remaining =
    seconds * 1000 - (Date.now() - last);

  return remaining > 0
    ? Math.ceil(remaining / 1000)
    : 0;
}

function setCooldown(player, command) {
  player.cooldowns[command] = Date.now();
}

// ======================================================
// PLAYER PROFILE
// ======================================================

function profileEmbed(user) {
  const player = getPlayer(user);

  const active =
    CHARACTERS[player.activeCharacter];

  return makeEmbed(
    `⚽ ${user.username}'s Blue Lock Profile`,
    [
      `**Level:** ${player.level}`,
      `**XP:** ${player.xp}/${requiredXP(player.level)}`,
      `**Rating:** ${player.rating}`,
      `**Career:** ${player.career}`,
      `**Club:** ${player.club}`,
      `**Country:** ${player.country}`,
      ``,
      `**💰 Coins:** ${player.coins}`,
      `**💎 Gems:** ${player.gems}`,
      ``,
      `**Active Character:** ${active?.name || "None"}`,
      `**Characters Owned:** ${characterCount(player)}`,
      ``,
      `**Matches:** ${player.statistics.matches}`,
      `**Wins:** ${player.statistics.wins}`,
      `**Losses:** ${player.statistics.losses}`,
      `**Goals:** ${player.statistics.goals}`,
      `**Assists:** ${player.statistics.assists}`
    ].join("\n"),
    COLORS.BLUE
  );
}

// ======================================================
// CHARACTER EMBED
// ======================================================

function characterEmbed(characterId) {
  const char = CHARACTERS[characterId];

  if (!char) return null;

  const statText = Object.entries(char.stats)
    .map(([stat, value]) => `**${stat}:** ${value}`)
    .join("\n");

  const skills = char.skills
    .map(
      skill =>
        `**${skill[0]}** — ${skill[1]}\n${skill[2]}`
    )
    .join("\n\n");

  return makeEmbed(
    `⚽ ${char.name}`,
    [
      `**Rarity:** ${char.rarity}`,
      `**Rating:** ${char.rating}`,
      `**Position:** ${char.position}`,
      `**Club:** ${char.club}`,
      `**Country:** ${char.country}`,
      ``,
      `### Stats`,
      statText,
      ``,
      `### Skills`,
      skills
    ].join("\n"),
    rarityColor(char.rarity)
  );
}

// ======================================================
// COMMANDS
// ======================================================

const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your Blue Lock profile"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll for a Blue Lock character"),

  new SlashCommandBuilder()
    .setName("characters")
    .setDescription("View your character collection"),

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
    .setName("stats")
    .setDescription("View your football statistics"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View your coins and gems"),

  new SlashCommandBuilder()
    .setName("career")
    .setDescription("View your career"),

  new SlashCommandBuilder()
    .setName("clubs")
    .setDescription("View available clubs"),

  new SlashCommandBuilder()
    .setName("countries")
    .setDescription("View available countries"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the Blue Lock leaderboard"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View bot commands"),

  new SlashCommandBuilder()
    .setName("setcharacter")
    .setDescription("Set your active character")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Character name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Play a Blue Lock match")
];

// ======================================================
// SLASH COMMAND REGISTRATION
// ======================================================

async function registerCommands() {
  const rest = new REST({ version: "10" })
    .setToken(TOKEN);

  const body = commands.map(command =>
    command.toJSON()
  );

  try {
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        { body }
      );

      console.log(
        `✅ Registered ${body.length} guild slash commands.`
      );
    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body }
      );

      console.log(
        `✅ Registered ${body.length} global slash commands.`
      );
    }
  } catch (error) {
    console.error(
      "❌ Slash command registration failed:",
      error
    );
  }
}

// ======================================================
// PREFIX COMMANDS
// ======================================================

async function handleCommand(message, command, args) {
  const player = getPlayer(message.author);

  switch (command) {

    case "help": {
      const embed = makeEmbed(
        "⚽ Blue Lock RPG",
        [
          `**Profile**`,
          "`,profile` / `/profile`",
          "",
          `**Gacha**`,
          "`,roll` / `/roll`",
          "`,characters` / `/characters`",
          "`,character <name>` / `/character`",
          "",
          `**Career**`,
          "`,career` / `/career`",
          "`,clubs` / `/clubs`",
          "`,countries` / `/countries`",
          "",
          `**Progression**`,
          "`,daily` / `/daily`",
          "`,match` / `/match`",
          "`,stats` / `/stats`",
          "`,balance` / `/balance`",
          "",
          `**Other**`,
          "`,leaderboard` / `/leaderboard`",
          "`,setcharacter <name>` / `/setcharacter`"
        ].join("\n"),
        COLORS.PURPLE
      );

      return message.reply({
        embeds: [embed]
      });
    }

    case "profile":
      return message.reply({
        embeds: [profileEmbed(message.author)]
      });

    case "balance":
      return message.reply({
        embeds: [
          makeEmbed(
            "💰 Balance",
            `**Coins:** ${player.coins}\n**Gems:** ${player.gems}`,
            COLORS.GOLD
          )
        ]
      });

    case "roll": {
      const remaining =
        cooldownRemaining(player, "roll", 10);

      if (remaining > 0) {
        return message.reply(
          `⏳ You can roll again in **${remaining}s**.`
        );
      }

      if (player.gems < 10) {
        return message.reply(
          "❌ You need **10 gems** to roll."
        );
      }

      setCooldown(player, "roll");
      player.gems -= 10;

      const result = rollCharacter();

      if (!player.characters[result.id]) {
        player.characters[result.id] = {
          copies: 0,
          level: 1,
          flow: 0
        };
      }

      player.characters[result.id].copies++;

      saveDatabase();

      const embed = characterEmbed(result.id);

      embed.setTitle(
        `🎰 You rolled ${result.character.name}!`
      );

      embed.setFooter({
        text: `Rarity: ${result.character.rarity}`
      });

      return message.reply({
        embeds: [embed]
      });
    }

    case "characters": {
      const owned = Object.entries(player.characters)
        .filter(([_, data]) => data.copies > 0);

      if (!owned.length) {
        return message.reply(
          "❌ You don't own any characters."
        );
      }

      const text = owned
        .map(([id, data]) => {
          const char = CHARACTERS[id];

          return `**${char.name}** — ${char.rarity} • Lv.${data.level} • x${data.copies}`;
        })
        .join("\n");

      return message.reply({
        embeds: [
          makeEmbed(
            "📚 Character Collection",
            text,
            COLORS.PURPLE
          )
        ]
      });
    }

    case "character": {
      const name = args.join(" ").toLowerCase();

      const id = Object.keys(CHARACTERS)
        .find(key =>
          CHARACTERS[key].name.toLowerCase() === name ||
          key === name
        );

      if (!id) {
        return message.reply(
          "❌ Character not found."
        );
      }

      return message.reply({
        embeds: [characterEmbed(id)]
      });
    }

    case "setcharacter": {
      const name = args.join(" ").toLowerCase();

      const id = Object.keys(CHARACTERS)
        .find(key =>
          key === name ||
          CHARACTERS[key].name.toLowerCase() === name
        );

      if (!id) {
        return message.reply(
          "❌ Character not found."
        );
      }

      if (!player.characters[id]) {
        return message.reply(
          "❌ You don't own this character."
        );
      }

      player.activeCharacter = id;
      saveDatabase();

      return message.reply(
        `✅ Your active character is now **${CHARACTERS[id].name}**.`
      );
    }

    case "stats": {
      const stats = player.statistics;

      const text = Object.entries(stats)
        .map(([key, value]) =>
          `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
        )
        .join("\n");

      return message.reply({
        embeds: [
          makeEmbed(
            "📊 Football Statistics",
            text,
            COLORS.CYAN
          )
        ]
      });
    }

    case "career":
      return message.reply({
        embeds: [
          makeEmbed(
            "🏆 Career",
            [
              `**Career:** ${player.career}`,
              `**Level:** ${player.level}`,
              `**Rating:** ${player.rating}`,
              `**Club:** ${player.club}`,
              `**Country:** ${player.country}`,
              ``,
              `**Trophies:** ${player.trophies.length}`
            ].join("\n"),
            COLORS.GOLD
          )
        ]
      });

    case "clubs":
      return message.reply({
        embeds: [
          makeEmbed(
            "🏟️ Clubs",
            CLUBS.map((club, i) =>
              `${i + 1}. ${club}`
            ).join("\n"),
            COLORS.BLUE
          )
        ]
      });

    case "countries":
      return message.reply({
        embeds: [
          makeEmbed(
            "🌍 Countries",
            COUNTRIES.map((country, i) =>
              `${i + 1}. ${country}`
            ).join("\n"),
            COLORS.GREEN
          )
        ]
      });

    case "daily": {
      const remaining =
        cooldownRemaining(
          player,
          "daily",
          86400
        );

      if (remaining > 0) {
        const hours =
          Math.floor(remaining / 3600);

        return message.reply(
          `⏳ Your daily reward is ready in **${hours}h**.`
        );
      }

      setCooldown(player, "daily");

      player.coins += 2500;
      player.gems += 25;

      const levels =
        addXP(player, 500);

      saveDatabase();

      return message.reply({
        embeds: [
          makeEmbed(
            "🎁 Daily Reward",
            [
              "You received:",
              "",
              "**+2,500 Coins**",
              "**+25 Gems**",
              "**+500 XP**",
              levels
                ? `\n🎉 You leveled up **${levels}** time(s)!`
                : ""
            ].join("\n"),
            COLORS.GOLD
          )
        ]
      });
    }

    case "match": {
      const remaining =
        cooldownRemaining(
          player,
          "match",
          30
        );

      if (remaining > 0) {
        return message.reply(
          `⏳ You can play another match in **${remaining}s**.`
        );
      }

      setCooldown(player, "match");

      const active =
        CHARACTERS[player.activeCharacter];

      const power =
        active?.rating || player.rating;

      const opponent =
        Math.floor(
          70 + Math.random() * 31
        );

      const playerScore =
        Math.max(
          0,
          Math.floor(
            Math.random() * 4 +
            (power - opponent) / 20
          )
        );

      const opponentScore =
        Math.floor(
          Math.random() * 4
        );

      player.statistics.matches++;

      let result;
      let color;

      if (playerScore > opponentScore) {
        result = "🏆 VICTORY";
        color = COLORS.GREEN;

        player.statistics.wins++;
        player.coins += 1500;
        player.gems += 5;

        const goals =
          Math.max(1, playerScore);

        player.statistics.goals += goals;

        addXP(player, 750);
      } else if (playerScore < opponentScore) {
        result = "💀 DEFEAT";
        color = COLORS.RED;

        player.statistics.losses++;
        player.coins += 300;

        addXP(player, 250);
      } else {
        result = "🤝 DRAW";
        color = COLORS.GOLD;

        player.statistics.draws++;
        player.coins += 700;

        addXP(player, 450);
      }

      saveDatabase();

      return message.reply({
        embeds: [
          makeEmbed(
            result,
            [
              `**Your Team:** ${playerScore}`,
              `**Opponent:** ${opponentScore}`,
              "",
              `**Character:** ${active?.name || "Unknown"}`,
              `**Power:** ${power}`,
              `**Opponent Power:** ${opponent}`,
              "",
              `**Coins:** ${player.coins}`,
              `**Gems:** ${player.gems}`
            ].join("\n"),
            color
          )
        ]
      });
    }

    case "leaderboard": {
      const players = Object.values(db.players)
        .sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }

          return b.statistics.wins -
            a.statistics.wins;
        })
        .slice(0, 10);

      if (!players.length) {
        return message.reply(
          "❌ There are no players yet."
        );
      }

      const text = players
        .map((p, index) =>
          `**${index + 1}.** ${p.username} — ⭐ ${p.rating} • 🏆 ${p.statistics.wins} wins`
        )
        .join("\n");

      return message.reply({
        embeds: [
          makeEmbed(
            "🏆 Blue Lock Rankings",
            text,
            COLORS.GOLD
          )
        ]
      });
    }

    default:
      return message.reply(
        `❌ Unknown command. Use \`${PREFIX}help\`.`
      );
  }
}

// ======================================================
// PREFIX EVENT
// ======================================================

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) {
    return;
  }

  const content =
    message.content.slice(PREFIX.length).trim();

  if (!content) return;

  const args =
    content.split(/\s+/);

  const command =
    args.shift().toLowerCase();

  try {
    await handleCommand(
      message,
      command,
      args
    );
  } catch (error) {
    console.error(
      `Command error (${command}):`,
      error
    );

    await message.reply(
      "❌ Something went wrong while executing that command."
    );
  }
});

// ======================================================
// SLASH EVENT
// ======================================================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    const command =
      interaction.commandName;

    const player =
      getPlayer(interaction.user);

    switch (command) {

      case "profile":
        return interaction.reply({
          embeds: [
            profileEmbed(interaction.user)
          ]
        });

      case "balance":
        return interaction.reply({
          embeds: [
            makeEmbed(
              "💰 Balance",
              `**Coins:** ${player.coins}\n**Gems:** ${player.gems}`,
              COLORS.GOLD
            )
          ]
        });

      case "help":
        return interaction.reply({
          embeds: [
            makeEmbed(
              "⚽ Blue Lock RPG",
              [
                "`/profile` — Profile",
                "`/roll` — Roll a character",
                "`/characters` — Collection",
                "`/character` — Character info",
                "`/stats` — Statistics",
                "`/balance` — Currency",
                "`/career` — Career",
                "`/clubs` — Clubs",
                "`/countries` — Countries",
                "`/daily` — Daily reward",
                "`/match` — Play a match",
                "`/leaderboard` — Rankings",
                "`/setcharacter` — Active character"
              ].join("\n"),
              COLORS.PURPLE
            )
          ]
        });

      case "roll": {
        const remaining =
          cooldownRemaining(
            player,
            "roll",
            10
          );

        if (remaining > 0) {
          return interaction.reply(
            `⏳ You can roll again in **${remaining}s**.`
          );
        }

        if (player.gems < 10) {
          return interaction.reply(
            "❌ You need **10 gems** to roll."
          );
        }

        setCooldown(player, "roll");
        player.gems -= 10;

        const result =
          rollCharacter();

        if (!player.characters[result.id]) {
          player.characters[result.id] = {
            copies: 0,
            level: 1,
            flow: 0
          };
        }

        player.characters[result.id].copies++;

        saveDatabase();

        return interaction.reply({
          embeds: [
            characterEmbed(result.id)
          ]
        });
      }

      case "characters": {
        const owned =
          Object.entries(player.characters)
            .filter(([_, data]) =>
              data.copies > 0
            );

        if (!owned.length) {
          return interaction.reply(
            "❌ You don't own any characters."
          );
        }

        const text =
          owned.map(([id, data]) => {
            const char =
              CHARACTERS[id];

            return `**${char.name}** — ${char.rarity} • Lv.${data.level} • x${data.copies}`;
          }).join("\n");

        return interaction.reply({
          embeds: [
            makeEmbed(
              "📚 Character Collection",
              text,
              COLORS.PURPLE
            )
          ]
        });
      }

      case "character": {
        const name =
          interaction.options
            .getString("name")
            .toLowerCase();

        const id =
          Object.keys(CHARACTERS)
            .find(key =>
              key === name ||
              CHARACTERS[key]
                .name
                .toLowerCase() === name
            );

        if (!id) {
          return interaction.reply(
            "❌ Character not found."
          );
        }

        return interaction.reply({
          embeds: [
            characterEmbed(id)
          ]
        });
      }

      case "stats": {
        const text =
          Object.entries(
            player.statistics
          )
            .map(([key, value]) =>
              `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
            )
            .join("\n");

        return interaction.reply({
          embeds: [
            makeEmbed(
              "📊 Football Statistics",
              text,
              COLORS.CYAN
            )
          ]
        });
      }

      case "career":
        return interaction.reply({
          embeds: [
            makeEmbed(
              "🏆 Career",
              [
                `**Career:** ${player.career}`,
                `**Level:** ${player.level}`,
                `**Rating:** ${player.rating}`,
                `**Club:** ${player.club}`,
                `**Country:** ${player.country}`,
                `**Trophies:** ${player.trophies.length}`
              ].join("\n"),
              COLORS.GOLD
            )
          ]
        });

      case "clubs":
        return interaction.reply({
          embeds: [
            makeEmbed(
              "🏟️ Clubs",
              CLUBS.map(
                (club, i) =>
                  `${i + 1}. ${club}`
              ).join("\n"),
              COLORS.BLUE
            )
          ]
        });

      case "countries":
        return interaction.reply({
          embeds: [
            makeEmbed(
              "🌍 Countries",
              COUNTRIES.map(
                (country, i) =>
                  `${i + 1}. ${country}`
              ).join("\n"),
              COLORS.GREEN
            )
          ]
        });

      case "daily": {
        const remaining =
          cooldownRemaining(
            player,
            "daily",
            86400
          );

        if (remaining > 0) {
          const hours =
            Math.floor(
              remaining / 3600
            );

          return interaction.reply(
            `⏳ Your daily reward is ready in **${hours}h**.`
          );
        }

        setCooldown(
          player,
          "daily"
        );

        player.coins += 2500;
        player.gems += 25;

        const levels =
          addXP(player, 500);

        saveDatabase();

        return interaction.reply({
          embeds: [
            makeEmbed(
              "🎁 Daily Reward",
              [
                "**+2,500 Coins**",
                "**+25 Gems**",
                "**+500 XP**",
                levels
                  ? `🎉 Level Up x${levels}`
                  : ""
              ].join("\n"),
              COLORS.GOLD
            )
          ]
        });
      }

      case "match": {
        const remaining =
          cooldownRemaining(
            player,
            "match",
            30
          );

        if (remaining > 0) {
          return interaction.reply(
            `⏳ You can play another match in **${remaining}s**.`
          );
        }

        setCooldown(
          player,
          "match"
        );

        const active =
          CHARACTERS[
            player.activeCharacter
          ];

        const power =
          active?.rating ||
          player.rating;

        const opponent =
          Math.floor(
            70 + Math.random() * 31
          );

        const playerScore =
          Math.max(
            0,
            Math.floor(
              Math.random() * 4 +
              (power - opponent) / 20
            )
          );

        const opponentScore =
          Math.floor(
            Math.random() * 4
          );

        player.statistics.matches++;

        let result;
        let color;

        if (
          playerScore >
          opponentScore
        ) {
          result = "🏆 VICTORY";
          color = COLORS.GREEN;

          player.statistics.wins++;
          player.statistics.goals +=
            Math.max(1, playerScore);

          player.coins += 1500;
          player.gems += 5;

          addXP(player, 750);
        } else if (
          playerScore <
          opponentScore
        ) {
          result = "💀 DEFEAT";
          color = COLORS.RED;

          player.statistics.losses++;
          player.coins += 300;

          addXP(player, 250);
        } else {
          result = "🤝 DRAW";
          color = COLORS.GOLD;

          player.statistics.draws++;
          player.coins += 700;

          addXP(player, 450);
        }

        saveDatabase();

        return interaction.reply({
          embeds: [
            makeEmbed(
              result,
              [
                `**Your Team:** ${playerScore}`,
                `**Opponent:** ${opponentScore}`,
                "",
                `**Character:** ${active?.name || "Unknown"}`,
                `**Power:** ${power}`,
                `**Opponent Power:** ${opponent}`,
                "",
                `**Coins:** ${player.coins}`,
                `**Gems:** ${player.gems}`
              ].join("\n"),
              color
            )
          ]
        });
      }

      case "leaderboard": {
        const players =
          Object.values(db.players)
            .sort((a, b) => {
              if (
                b.rating !== a.rating
              ) {
                return (
                  b.rating -
                  a.rating
                );
              }

              return (
                b.statistics.wins -
                a.statistics.wins
              );
            })
            .slice(0, 10);

        const text =
          players.map(
            (p, i) =>
              `**${i + 1}.** ${p.username} — ⭐ ${p.rating} • 🏆 ${p.statistics.wins} wins`
          ).join("\n");

        return interaction.reply({
          embeds: [
            makeEmbed(
              "🏆 Blue Lock Rankings",
              text ||
                "No players yet.",
              COLORS.GOLD
            )
          ]
        });
      }

      case "setcharacter": {
        const name =
          interaction.options
            .getString("name")
            .toLowerCase();

        const id =
          Object.keys(CHARACTERS)
            .find(key =>
              key === name ||
              CHARACTERS[key]
                .name
                .toLowerCase() === name
            );

        if (!id) {
          return interaction.reply(
            "❌ Character not found."
          );
        }

        if (!player.characters[id]) {
          return interaction.reply(
            "❌ You don't own this character."
          );
        }

        player.activeCharacter = id;

        saveDatabase();

        return interaction.reply(
          `✅ Active character set to **${CHARACTERS[id].name}**.`
        );
      }

      default:
        return interaction.reply(
          "❌ Unknown slash command."
        );
    }
  } catch (error) {
    console.error(
      "Slash command error:",
      error
    );

    if (interaction.replied) {
      return interaction.followUp(
        "❌ Something went wrong."
      );
    }

    return interaction.reply(
      "❌ Something went wrong."
    );
  }
});

// ======================================================
// READY
// ======================================================

client.once("clientReady", async () => {
  console.log(
    `✅ Logged in as ${client.user.tag}`
  );

  console.log(
    `👥 Servers: ${client.guilds.cache.size}`
  );

  console.log(
    `⚽ Blue Lock RPG is online.`
  );

  await registerCommands();
});

// ======================================================
// ERROR HANDLING
// ======================================================

client.on("error", error => {
  console.error(
    "Discord client error:",
    error
  );
});

process.on("unhandledRejection", error => {
  console.error(
    "Unhandled rejection:",
    error
  );
});

process.on("uncaughtException", error => {
  console.error(
    "Uncaught exception:",
    error
  );
});

// ======================================================
// LOGIN
// ======================================================

console.log("🚀 Starting Blue Lock RPG...");

client.login(TOKEN).catch(error => {
  console.error(
    "❌ Discord login failed:",
    error
  );
});
