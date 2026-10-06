const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

function save() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
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
  ["Lavinho NEL", 100, "LW", "Brazil", "FC Barcha", ["Magician", "Brazilian Dance", "Creative Dribble"]]
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

function findCharacter(input) {
  const q = normalize(input);

  if (aliases[q]) return characters[aliases[q].toLowerCase()];
  if (characters[q]) return characters[q];

  const found = Object.values(characters).find(c =>
    normalize(c.name).includes(q) || q.includes(normalize(c.name))
  );

  return found || null;
}

function findFlow(input) {
  const q = normalize(input);

  if (FLOWS[q]) return FLOWS[q];

  return Object.values(FLOWS).find(f =>
    normalize(f.name).includes(q)
  ) || null;
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

  return db[id];
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
   REALISTIC MATCH RATING
========================= */

function calculateRating(stats, result, position = "ST") {
  let rating = 6.2;

  rating += stats.goals * 0.9;
  rating += stats.assists * 0.6;
  rating += stats.shotsOnTarget * 0.12;
  rating += stats.keyPasses * 0.12;
  rating += stats.dribbles * 0.08;
  rating += stats.tackles * (position === "CB" ? 0.12 : 0.05);
  rating += stats.interceptions * (position === "CB" ? 0.1 : 0.04);

  rating -= stats.missedChances * 0.18;
  rating -= stats.badPasses * 0.08;
  rating -= stats.turnovers * 0.05;

  if (result === "win") rating += 0.3;
  if (result === "loss") rating -= 0.3;

  /*
    Rough real-football scale:
    6.0 = poor/average
    6.5 = okay
    7.0 = solid
    7.5 = good
    8.0 = very good
    9.0 = outstanding
    10.0 = extremely rare
  */

  return Math.max(4.5, Math.min(10, Number(rating.toFixed(1))));
}

/* =========================
   MATCH SYSTEM
========================= */

const matches = new Map();

function createMatch(userId) {
  const p = getPlayer(userId);

  const player = p.activePlayer
    ? findCharacter(p.activePlayer)
    : null;

  const rating = player ? player.rating : p.rating;

  const match = {
    userId,
    rating,
    position: player?.position || p.position,
    score: 0,
    opponentScore: 0,
    minute: 1,
    finished: false,
    bestMoment: false,
    worstMoment: false,
    flowUsed: false,
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
    }
  };

  matches.set(userId, match);
  return match;
}

function matchEmbed(userId) {
  const m = matches.get(userId);
  const p = getPlayer(userId);

  const flowAllowed =
    userId === OWNER_ID ||
    m.bestMoment ||
    m.worstMoment;

  const flowText = p.activeFlow
    ? `${p.activeFlow}${flowAllowed ? " 🟢" : " 🔒"}`
    : "None";

  return new EmbedBuilder()
    .setTitle("⚽ Blue Lock Match")
    .setDescription(
      `**${m.score} - ${m.opponentScore}**\n\n` +
      `⏱️ Minute: **${m.minute}'**\n` +
      `⭐ Match Rating: **${calculateRating(m.stats, m.score > m.opponentScore ? "win" : m.score < m.opponentScore ? "loss" : "draw", m.position)}**\n` +
      `🔥 Flow: **${flowText}**`
    )
    .addFields(
      { name: "Goals", value: `${m.stats.goals}`, inline: true },
      { name: "Assists", value: `${m.stats.assists}`, inline: true },
      { name: "Dribbles", value: `${m.stats.dribbles}`, inline: true },
      { name: "Key Passes", value: `${m.stats.keyPasses}`, inline: true },
      { name: "Best Moment", value: m.bestMoment ? "🔥 ACTIVE" : "—", inline: true },
      { name: "Worst Moment", value: m.worstMoment ? "💀 ACTIVE" : "—", inline: true }
    );
}

function matchButtons(userId) {
  const m = matches.get(userId);
  const p = getPlayer(userId);

  const flowAllowed =
    userId === OWNER_ID ||
    m.bestMoment ||
    m.worstMoment;

  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`match_shoot_${userId}`)
        .setLabel("Shoot")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`match_pass_${userId}`)
        .setLabel("Pass")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`match_dribble_${userId}`)
        .setLabel("Dribble")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`match_flow_${userId}`)
        .setLabel("Flow")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!flowAllowed || !p.activeFlow)
    )
  ];
}

/* =========================
   MATCH ACTIONS
========================= */

async function processAction(interaction, action) {
  const userId = interaction.user.id;
  const m = matches.get(userId);

  if (!m || m.finished) {
    return interaction.reply({
      content: "❌ You don't have an active match.",
      ephemeral: true
    });
  }

  const p = getPlayer(userId);

  /*
    OWNER:
    Every action succeeds.
    Unlimited stamina.
    Flow anytime.
  */

  const owner = userId === OWNER_ID;

  if (action === "flow") {
    const allowed = owner || m.bestMoment || m.worstMoment;

    if (!allowed) {
      return interaction.reply({
        content: "🔒 Flow can only be activated during your Best Moment or Worst Moment.",
        ephemeral: true
      });
    }

    if (!p.activeFlow) {
      return interaction.reply({
        content: "❌ You don't have an active Flow.",
        ephemeral: true
      });
    }

    if (!owner && m.flowUsed) {
      return interaction.reply({
        content: "⏳ You've already used Flow in this match.",
        ephemeral: true
      });
    }

    m.flowUsed = true;

    if (!owner) {
      p.flowCooldown = 180;
    }

    return interaction.reply({
      content:
        `🔥 **${p.activeFlow} FLOW ACTIVATED!**\n` +
        `You can now use your Flow abilities.`
    });
  }

  m.minute += Math.floor(Math.random() * 8) + 2;

  if (m.minute > 90) m.minute = 90;

  let success;

  if (owner) {
    success = true;
  } else {
    const base = Math.max(0.35, Math.min(0.85, m.rating / 120));
    success = Math.random() < base;
  }

  if (action === "shoot") {
    if (success) {
      m.score++;
      m.stats.goals++;
      m.stats.shotsOnTarget++;

      m.bestMoment = true;
      m.worstMoment = false;

      addXP(p, 35);

      await interaction.update({
        embeds: [matchEmbed(userId)],
        components: [matchButtons(userId)]
      });

      return;
    }

    m.stats.missedChances++;

    // A failed attack can create a worst moment.
    if (Math.random() < 0.35 || owner) {
      m.worstMoment = true;
      m.bestMoment = false;
    }
  }

  if (action === "pass") {
    if (success) {
      m.stats.keyPasses++;

      if (Math.random() < 0.25 || owner) {
        m.stats.assists++;
        m.bestMoment = true;
        m.worstMoment = false;
      }
    } else {
      m.stats.badPasses++;
      m.worstMoment = true;
      m.bestMoment = false;
    }
  }

  if (action === "dribble") {
    if (success) {
      m.stats.dribbles++;

      if (Math.random() < 0.2 || owner) {
        m.bestMoment = true;
        m.worstMoment = false;
      }
    } else {
      m.stats.turnovers++;

      if (Math.random() < 0.4 || owner) {
        m.worstMoment = true;
        m.bestMoment = false;
      }
    }
  }

  /*
    Opponent attack.
    Owner is protected from random negative stamina effects,
    but the match can still progress.
  */

  if (!owner && Math.random() < 0.12) {
    m.opponentScore++;
  }

  if (m.minute >= 90) {
    m.finished = true;

    const result =
      m.score > m.opponentScore
        ? "win"
        : m.score < m.opponentScore
        ? "loss"
        : "draw";

    const finalRating = calculateRating(
      m.stats,
      result,
      m.position
    );

    p.stats.matches++;
    p.stats.goals += m.stats.goals;
    p.stats.assists += m.stats.assists;

    if (result === "win") p.stats.wins++;
    if (result === "loss") p.stats.losses++;
    if (result === "draw") p.stats.draws++;

    if (finalRating > p.stats.bestRating) {
      p.stats.bestRating = finalRating;
    }

    if (finalRating >= 8.5) {
      p.stats.motm++;
      addXP(p, 75);
    } else {
      addXP(p, 30);
    }

    if (result === "win") p.coins += 5000;
    if (result === "draw") p.coins += 2000;

    save();

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏁 Match Finished")
          .setDescription(
            `**${m.score} - ${m.opponentScore}**\n\n` +
            `⭐ Final Rating: **${finalRating}**\n` +
            `🏆 Result: **${result.toUpperCase()}**`
          )
          .addFields(
            { name: "Goals", value: `${m.stats.goals}`, inline: true },
            { name: "Assists", value: `${m.stats.assists}`, inline: true },
            { name: "Dribbles", value: `${m.stats.dribbles}`, inline: true },
            { name: "Key Passes", value: `${m.stats.keyPasses}`, inline: true }
          )
      ],
      components: []
    });

    matches.delete(userId);
    return;
  }

  await interaction.update({
    embeds: [matchEmbed(userId)],
    components: [matchButtons(userId)]
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
      "`,resetplayer @user`"
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

  const target = message.mentions.users.first();

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
      "resetplayer"
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
    getPlayer(target.id).club = args.join(" ") || "Free Agent";

    save();

    return message.reply(`🏟️ Club set.`);
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
      "resetplayer"
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
            { name: "Flow", value: p.activeFlow || "None", inline: true }
          )
      ]
    });
  }

  if (command === "character" || command === "char") {
    const c = findCharacter(args.join(" "));

    if (!c) return message.reply("❌ Character not found.");

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`⚽ ${c.name}`)
          .setDescription(
            `⭐ Rating: **${c.rating}**\n` +
            `📍 Position: **${c.position}**\n` +
            `🌍 Country: **${c.country}**\n` +
            `🏟️ Club: **${c.club}**`
          )
          .addFields({
            name: "Skills",
            value: c.skills.map(x => `• ${x}`).join("\n")
          })
      ]
    });
  }

  if (command === "setplayer") {
    const c = findCharacter(args.join(" "));

    if (!c) return message.reply("❌ You don't have that character.");

    if (!p.players.includes(c.name)) {
      return message.reply("❌ You don't own this character.");
    }

    p.activePlayer = c.name;
    p.rating = c.rating;
    p.position = c.position;

    save();

    return message.reply(`✅ Active player: **${c.name}**`);
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

    const m = createMatch(message.author.id);

    return message.reply({
      embeds: [matchEmbed(message.author.id)],
      components: [matchButtons(message.author.id)]
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
    if (!p.activeFlow) {
      return message.reply("❌ You don't have an active Flow.");
    }

    const f = findFlow(p.activeFlow);

    return message.reply(
      `🔥 **${f.name} Flow**\n\n` +
      f.abilities.map((x, i) => `${i + 1}. ${x}`).join("\n")
    );
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
      "`,flow` — Flow information\n" +
      "`,match` — Start match\n" +
      "`,train` — Train\n" +
      "`,rest` — Restore stamina\n" +
      "`,stats` — Career statistics"
    );
  }
}

/* =========================
   BUTTON HANDLER
========================= */

client.on("interactionCreate", async interaction => {
  try {
    if (!interaction.isButton()) return;

    const parts = interaction.customId.split("_");
    const action = parts[1];
    const userId = parts[2];

    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "❌ This isn't your match.",
        ephemeral: true
      });
    }

    if (!matches.has(userId)) {
      return interaction.reply({
        content: "❌ This match has ended.",
        ephemeral: true
      });
    }

    /*
      IMPORTANT:
      We acknowledge the interaction immediately through
      processAction -> update/reply.
      This prevents "didn't respond in time".
    */

    await processAction(interaction, action);

  } catch (err) {
    console.error("Interaction error:", err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Something went wrong while processing that action.",
        ephemeral: true
      }).catch(() => {});
    }
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
    .setDescription("View a character")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Character name")
        .setRequired(true)
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
        components: [matchButtons(interaction.user.id)]
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

      return interaction.reply(
        `⚽ **${c.name}**\n` +
        `⭐ ${c.rating} OVR\n` +
        `📍 ${c.position}\n` +
        `🏟️ ${c.club}\n\n` +
        `**Skills:** ${c.skills.join(", ")}`
      );
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

  } catch (err) {
    console.error("Slash error:", err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Something went wrong.",
        ephemeral: true
      }).catch(() => {});
    }
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
