import { Client, GatewayIntentBits } from 'discord.js';
import { generateDependencyReport } from '@discordjs/voice';
import { config } from 'dotenv';
config();
import { BOT_TOKEN, BOT_DEFAULT_ACTIVITY } from '@/constants/config';
import { run } from '@/commands';
import { messageEvent } from '@/messages';

if (process.env.NODE_ENV === 'production') {
  // DO SOMETHING
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ]
});

client.on('ready', () => {
  console.log(generateDependencyReport());
  console.log('🏃‍♂️ Bot is online! 💨');

  client.user?.setActivity(BOT_DEFAULT_ACTIVITY);
});

client.once('reconnecting', () => {
  console.log('🔗 Reconnecting!');
});

client.once('disconnect', () => {
  console.log('🛑 Disconnect!');
});

(async () => {
  try {
    await client.login(BOT_TOKEN);
    messageEvent(client);
    run(client);
  } catch (e: any) {
    console.log('Error:', e.stack);
  }
})();
