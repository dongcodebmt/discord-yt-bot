import { Client } from 'discord.js';
import { schema } from '@/commands/schema';
import { CMD_PREFLIX } from '@/constants/config';

export const deploy = (client: Client): void => {
  client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();
    if (
      message.content.toLowerCase() === CMD_PREFLIX + 'deploy' &&
      message.author.id === client.application?.owner?.id
    ) {
      try {
        await message.guild.commands.set(schema);
        await message.reply('Deployed!');
      } catch (e) {
        message.reply('Fail to deploy!');
      }
    }
  });
};
