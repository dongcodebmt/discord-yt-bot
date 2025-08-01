import messages from '@/constants/messages';
import { servers } from '@/servers';
import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

export const pause = {
  name: 'pause',
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.deferReply();
    const server = servers.get(interaction.guildId as string);
    if (!server) {
      await interaction.followUp(messages.joinVoiceChannel);
      return;
    }
    if (server.audioPlayer.state.status === AudioPlayerStatus.Playing) {
      server.pause();
      await interaction.followUp(messages.paused);
      return;
    }
    await interaction.followUp(messages.notPlaying);
  },
};
