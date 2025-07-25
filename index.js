// index.js

require('dotenv').config();
const { Telegraf } = require('telegraf');
const { TelegramClient } = require('telegram');
const { NewMessage } = require('telegram/events');
const { StringSession } = require('telegram/sessions');
const express = require('express');

// ------------ Configuration ------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const API_ID = parseInt(process.env.API_ID, 10);
const API_HASH = process.env.API_HASH;
const SESSION_STRING = process.env.SESSION_STRING;
const PORT = process.env.PORT || 8080;

const SOURCE_CHAT_IDS = [
  -1001670336143, -1001777028234, -1001201589228, -1001307859655,
  -1001391583159, -1001302730016, -1001677362150, -1001292788769,
  -1002008663120, -1001310628379, -1001505792602, -1001908543098,
  -1001602718735, -1001422709367, -4702878226
];
const DESTINATION_CHAT_ID = -1002875492025;

// --- Web Server for Render ---
const app = express();
app.get('/', (req, res) => {
  res.send('✅ Bot is alive and running!');
});
app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
});

// --- Telegraf Bot ---
const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  if (SOURCE_CHAT_IDS.includes(chatId)) {
    try {
      await ctx.forwardMessage(DESTINATION_CHAT_ID);
      console.log(`📦 Telegraf forwarded message from ${chatId}`);
    } catch (err) {
      console.error('❌ Telegraf error:', err.message);
    }
  }
});

bot.launch()
  .then(() => {
    console.log('🤖 Telegraf bot launched');
    bot.telegram.sendMessage(DESTINATION_CHAT_ID, '✅ Bot is alive and forwarding messages.');
  })
  .catch(console.error);

// --- TelegramClient (GramJS / Telethon Equivalent) ---
const tgClient = new TelegramClient(
  new StringSession(SESSION_STRING),
  API_ID,
  API_HASH,
  { connectionRetries: 5 }
);

(async () => {
  try {
    await tgClient.start();
    console.log('📲 TelegramClient (GramJS) started with session');

    tgClient.addEventHandler(async (event) => {
      try {
        const chatId = Number(event.chatId?.value || event.chatId);
        const message = event.message?.message;
        if (SOURCE_CHAT_IDS.includes(chatId) && message) {
          await tgClient.sendMessage(DESTINATION_CHAT_ID, { message });
          console.log(`🔁 GramJS forwarded message from ${chatId}`);
        }
      } catch (err) {
        console.error('❌ GramJS forward error:', err.message);
      }
    }, new NewMessage({}));
  } catch (err) {
    console.error('❌ Failed to start TelegramClient:', err.message);
  }
})();
