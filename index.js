// index.js

require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { TelegramClient } = require('telegram');
const { NewMessage } = require('telegram/events');
const { StringSession } = require('telegram/sessions');

// --- Config ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const API_ID = parseInt(process.env.API_ID, 10);
const API_HASH = process.env.API_HASH;
const SESSION_STRING = process.env.SESSION_STRING;
const PORT = process.env.PORT || 8080;

const SOURCE_CHAT_IDS = [
  -1001670336143, -1001777028234, -1001201589228, -1001307859655,
  -1001391583159, -1001302730016, -1001677362150, -1001292788769,
  -1002008663120, -1001310628379, -1001505792602, -1001908543098,
  -1001602718735, -1001422709367, -7463446358
];
const DESTINATION_CHAT_ID = -1002875492025;

// --- Express Web Server (for UptimeRobot or health check) ---
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is alive and running!"));
app.listen(PORT, () => console.log(`🌐 Server is running on port ${PORT}`));

// --- Telegraf Bot (for bot token handling) ---
const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async (ctx) => {
  if (SOURCE_CHAT_IDS.includes(ctx.chat.id)) {
    try {
      await ctx.forwardMessage(DESTINATION_CHAT_ID);
      console.log(`🤖 Telegraf forwarded message from ${ctx.chat.id}`);
    } catch (err) {
      console.error("❌ Telegraf error:", err.message);
    }
  }
});

bot.launch()
  .then(() => {
    console.log("🚀 Telegraf bot started");
    bot.telegram.sendMessage(DESTINATION_CHAT_ID, "✅ Bot is alive and forwarding messages.");
  })
  .catch(console.error);

// --- GramJS TelegramClient (for user session handling) ---
const tgClient = new TelegramClient(
  new StringSession(SESSION_STRING),
  API_ID,
  API_HASH,
  { connectionRetries: 5 }
);

(async () => {
  try {
    await tgClient.start();
    console.log("📲 GramJS client logged in successfully");

    tgClient.addEventHandler(async (event) => {
      try {
        const chatId = Number(event.chatId?.value || event.chatId);
        const message = event.message?.message;
        if (SOURCE_CHAT_IDS.includes(chatId) && message) {
          await tgClient.sendMessage(DESTINATION_CHAT_ID, { message });
          console.log(`🔁 GramJS forwarded from ${chatId}`);
        }
      } catch (err) {
        console.error("❌ GramJS forwarding error:", err.message);
      }
    }, new NewMessage({}));
  } catch (err) {
    console.error("❌ Failed to start GramJS client:", err.message);
  }
})();
