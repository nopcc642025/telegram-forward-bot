// index.js

const { Telegraf } = require('telegraf');
const { TelegramClient } = require('telegram');
const { Api } = require('telegram');
const { NewMessage } = require('telegram/events');
const { StringSession } = require('telegram/sessions');
const express = require('express');
const readline = require('readline');
require('dotenv').config();

// ------------web 502 error debug --------
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ------------ Configuration ------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const API_ID = Number(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const PORT = process.env.PORT || 8080;

const SOURCE_CHAT_IDS = [
  -1001670336143, -1001777028234, -1001201589228, -1001307859655,
  -1001391583159, -1001302730016, -1001677362150, -1001292788769,
  -1002008663120, -1001310628379, -1001505792602, -1001908543098,
  -1001602718735, -1001422709367, -4702878226
];
const DESTINATION_CHAT_ID = -1002875492025;

// ------------ Web Server ------------
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ------------ Telegraf Bot (Aiogram equivalent) ------------
const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async (ctx) => {
  if (SOURCE_CHAT_IDS.includes(ctx.chat.id)) {
    try {
      await ctx.forwardMessage(DESTINATION_CHAT_ID);
      console.log(`Telegraf: Forwarded message ${ctx.message.message_id} from ${ctx.chat.id}`);
    } catch (err) {
      console.error(`Telegraf: Failed to forward message:`, err.message);
    }
  }
});

bot.launch().then(() => {
  console.log('🤖 Telegraf bot started');
  bot.telegram.sendMessage(DESTINATION_CHAT_ID, '✅ Bot is online and forwarding messages.');
}).catch(console.error);

// ------------ TelegramClient (GramJS / Telethon equivalent) ------------
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

const stringSession = new StringSession(''); // Can be reused if saved in a .env or database
const tgClient = new TelegramClient(stringSession, API_ID, API_HASH, { connectionRetries: 5 });

(async () => {
  await tgClient.start({
    phoneNumber: async () => await ask('Enter phone: '),
    password: async () => await ask('2FA password (if any): '),
    phoneCode: async () => await ask('Enter the code you received: '),
    onError: (err) => console.error(err)
  });

  console.log('📲 GramJS client started');

  tgClient.addEventHandler(async (event) => {
    try {
      const msg = event.message;
      const chatId = Number(event.chatId?.value || event.chatId);

      if (SOURCE_CHAT_IDS.includes(chatId)) {
        await tgClient.sendMessage(DESTINATION_CHAT_ID, { message: msg.message });
        console.log(`GramJS: Forwarded message from ${chatId}`);
      }
    } catch (error) {
      console.error('GramJS error:', error.message);
    }
  }, new NewMessage({}));
})();
