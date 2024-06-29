import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { generateDependencyReport } from '@discordjs/voice';
import { config } from 'dotenv';
config();
import { BOT_TOKEN, CMD_PREFLIX } from '@/constants/config';
import { run } from '@/commands';

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

  client.user?.setActivity({
    name: `music | ${CMD_PREFLIX}help`,
    type: ActivityType.Playing
  });
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
    run(client);
  } catch (e: any) {
    console.log('Error:', e.stack);
  }
})();
