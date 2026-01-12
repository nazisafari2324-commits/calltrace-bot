// ================== CONFIG ==================
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

// 🔐 BOT DETAILS (EDIT THESE)
const TOKEN = "8481267066:AAGfqiuCSNV4YIl27FgmsKssWj1aG4nzSYs";
const OWNER_ID = 7685285827;        // owner Telegram ID
const ALLOWED_GC = -1002170649258;  // allowed group ID

// 💸 FREE / PAID SETTINGS
const FREE_LIMIT = 2; // free uses per user (per restart)
const PAID_DAYS = 7;  // default paid duration

// ================== MEMORY STORE ==================
let usage = {};        // { userId: count }
let paidUsers = {};    // { userId: expiryTimestamp }
let banned = [];       // [ userId ]

// ================== INIT ==================
const bot = new TelegramBot(TOKEN, { polling: true });

// ================== HELPERS ==================
function isPaid(uid) {
  if (!paidUsers[uid]) return false;
  if (Date.now() > paidUsers[uid]) {
    delete paidUsers[uid];
    return false;
  }
  return true;
}

function canUse(uid) {
  if (isPaid(uid)) return true;
  usage[uid] = (usage[uid] || 0) + 1;
  return usage[uid] <= FREE_LIMIT;
}

// ================== SECURITY ==================
bot.on("message", (msg) => {
  if (banned.includes(msg.from.id)) return;

  if (msg.chat.type === "private" && msg.from.id !== OWNER_ID) {
    return bot.sendMessage(msg.chat.id, "❌ DM disabled");
  }
  if (msg.chat.type !== "private" && msg.chat.id !== ALLOWED_GC) return;
});

// ================== /num COMMAND ==================
bot.onText(/\/num (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const uid = msg.from.id;

  if (!canUse(uid)) {
    return bot.sendMessage(chatId, "❌ Free limit over. Contact admin.");
  }

  let num = match[1].replace(/\D/g, "");
  if (num.length !== 10) {
    return bot.sendMessage(chatId, "❌ 10 digit number bhejo");
  }

  try {
    const r = await fetch(`https://ab-calltraceapi.vercel.app/info?number=91${num}`);
    const d = await r.json();

    bot.sendMessage(
      chatId,
      `📞 +91${num}
📡 Operator: ${d.operator || "N/A"}
📍 Circle: ${d.circle || "N/A"}
🌍 Country: ${d.country || "N/A"}`
    );
  } catch (e) {
    bot.sendMessage(chatId, "❌ API error");
  }
});

// ================== ADMIN ==================
bot.onText(/\/addpaid (\d+)/, (msg, m) => {
  if (msg.from.id !== OWNER_ID) return;
  const uid = Number(m[1]);
  paidUsers[uid] = Date.now() + PAID_DAYS * 24 * 60 * 60 * 1000;
  bot.sendMessage(msg.chat.id, `✅ Paid added: ${uid} for ${PAID_DAYS} days`);
});

bot.onText(/\/ban (\d+)/, (msg, m) => {
  if (msg.from.id !== OWNER_ID) return;
  banned.push(Number(m[1]));
  bot.sendMessage(msg.chat.id, "🚫 User banned");
});

bot.onText(/\/unban (\d+)/, (msg, m) => {
  if (msg.from.id !== OWNER_ID) return;
  banned = banned.filter(x => x !== Number(m[1]));
  bot.sendMessage(msg.chat.id, "✅ User unbanned");
});

// ================== CREDIT ==================
console.log("Bot running | by mark @instarestorepro");
