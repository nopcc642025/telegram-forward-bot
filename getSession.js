const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input'); // npm install input
require('dotenv').config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession('');

(async () => {
  console.log('⚠️ Login flow starting...');
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => await input.text('📱 Enter your phone number: '),
    password: async () => await input.text('🔒 Enter 2FA password (if any): '),
    phoneCode: async () => await input.text('📨 Enter the code sent via Telegram: '),
    onError: (err) => console.log(err),
  });

  console.log('✅ Login successful!');
  console.log('📄 Your session string:\n');
  console.log(client.session.save());
})();
