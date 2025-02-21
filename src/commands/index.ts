import messages from '@/constants/messages';
import { Client, ActivityType, ActivityOptions } from 'discord.js';
import { servers } from '@/servers';
import { CMD_PREFLIX } from '@/constants/config';
import { help } from '@/commands/collections/help';
import { jump } from '@/commands/collections/jump';
import { leave } from '@/commands/collections/leave';
import { nowPlaying } from '@/commands/collections/nowplaying';
import { pause } from '@/commands/collections/pause';
import { ping } from '@/commands/collections/ping';
import { play } from '@/commands/collections/play';
import { queue } from '@/commands/collections/queue';
import { remove } from '@/commands/collections/remove';
import { resume } from '@/commands/collections/resume';
import { shuffle } from '@/commands/collections/shuffle';
import { skip } from '@/commands/collections/skip';
import { Platform } from '@/types';

export const run = (client: Client): void => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) return;
    try {
      switch (interaction.commandName) {
        case play.name:
          await play.execute(interaction);
          break;
        case Platform.SOUNDCLOUD.toLocaleLowerCase():
          await play.execute(interaction, Platform.SOUNDCLOUD);
          break;
        case skip.name:
          await skip.execute(interaction);
          break;
        case pause.name:
          await pause.execute(interaction);
          break;
        case resume.name:
          await resume.execute(interaction);
          break;
        case leave.name:
          await leave.execute(interaction);
          break;
        case nowPlaying.name:
          await nowPlaying.execute(interaction);
          break;
        case queue.name:
          await queue.execute(interaction);
          break;
        case jump.name:
          await jump.execute(interaction);
          break;
        case ping.name:
          await ping.execute(client, interaction);
          break;
        case remove.name:
          await remove.execute(interaction);
          break;
        case shuffle.name:
          await shuffle.execute(interaction);
          break;
        case help.name:
          await help.execute(interaction);
          break;
      }
    } catch (e) {
      interaction.reply(messages.error);
    }

    const server = servers.get(interaction.guildId as string);
    let activity: ActivityOptions = {
      name: `music | ${CMD_PREFLIX}help`,
      type: ActivityType.Playing
    };
    if (server && server.playing) {
      activity = {
        name: server.playing?.song.title,
        type: ActivityType.Streaming,
        url: server.playing?.song.url
      }
    }
    client.user?.setActivity(activity);
  });
};
