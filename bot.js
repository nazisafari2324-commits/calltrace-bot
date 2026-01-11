const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const TOKEN = "8481267066:AAGfqiuCSNV4YIl27FgmsKssWj1aG4nzSYs";
const OWNER_ID = 7685285827;
const ALLOWED_GC = -1002170649258;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  if (msg.chat.type === "private" && msg.from.id !== OWNER_ID) {
    return bot.sendMessage(msg.chat.id, "❌ DM access denied");
  }
  if (msg.chat.type !== "private" && msg.chat.id !== ALLOWED_GC) {
    return;
  }
});

bot.onText(/\/num (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (
    (msg.chat.type === "private" && msg.from.id !== OWNER_ID) ||
    (msg.chat.type !== "private" && chatId !== ALLOWED_GC)
  ) return;

  let number = match[1].replace(/\D/g, "");
  if (number.length !== 10) {
    return bot.sendMessage(chatId, "❌ 10 digit number bhejo");
  }

  const res = await fetch(
    `https://ab-calltraceapi.vercel.app/info?number=91${number}`
  );
  const data = await res.json();

  bot.sendMessage(chatId,
`📞 +91${number}
📡 Operator: ${data.operator || "N/A"}
📍 Circle: ${data.circle || "N/A"}
🌍 Country: ${data.country || "N/A"}`
  );
});
