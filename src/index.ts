import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
config();
import { BOT_TOKEN } from '@/constants/config';
import { run } from '@/commands';

if (process.env.NODE_ENV === 'production') {
  // DO SOMETHING
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log('🏃‍♂️💨 Bot is online!');
});

client.once('reconnecting', () => {
  console.log('🔗 Reconnecting!');
});

client.once('disconnect', () => {
  console.log('🛑 Disconnect!');
});

async function main() {
  await client.login(BOT_TOKEN);
  run(client);
}

(async () => {
  try {
    main();
  } catch (e: any) {
    console.log('Error:', e.stack);
    main();
  }
})();