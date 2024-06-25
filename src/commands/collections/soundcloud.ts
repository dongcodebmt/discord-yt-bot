import messages from '@/constants/messages';
import { Server } from '@/models/Server';
import { servers } from '@/servers';
import { SoundCloudService } from '@/services/soundcould';;
import { Platform, Playlist, QueueItem, Song, ItemType } from '@/types';
import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import { createPlayMessage } from '@/commands/messages/playMessage';

export const soundcloud = {
  name: 'soundcloud',
  execute: async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    let server = servers.get(interaction.guildId as string);
    if (!server) {
      if (
        interaction.member instanceof GuildMember &&
        interaction.member.voice.channel
      ) {
        const channel = interaction.member.voice.channel;
        server = new Server(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
          }),
          interaction.guildId as string,
        );
        servers.set(interaction.guildId as string, server);
      }
    }

    if (!server) {
      await interaction.followUp(messages.joinVoiceChannel);
      return;
    }

    // Make sure the connection is ready before processing the user's request
    try {
      await entersState(
        server.voiceConnection,
        VoiceConnectionStatus.Ready,
        20e3,
      );
    } catch (error) {
      await interaction.followUp(messages.failToJoinVoiceChannel);
      return;
    }
    try {
      const service = new SoundCloudService();
      const input = interaction.options.get('input')!.value! as string;
      const result = await service.getResult(input);
      const requester = interaction.member?.user.username ?? '';
      if ((result as Playlist).songs) {
        const playlist = (result as Playlist);
        await server.addSongs(playlist.songs.map(item => <QueueItem>{ song: item, requester }));
        interaction.followUp({
          embeds: [
            createPlayMessage({
              title: playlist.title,
              url: input,
              author: playlist.author,
              thumbnail: playlist.thumbnail,
              type: ItemType.PLAYLIST,
              length: playlist.songs.length,
              platform: Platform.SOUND_CLOUD,
              requester
            }),
          ],
        });
      } else {
        const song = (result as Song);
        await server.addSongs([{
          song: result as Song,
          requester: interaction.member?.user.username ?? ''
        }]);
        interaction.followUp({
          embeds: [
            createPlayMessage({
              title: song.title,
              url: song.url,
              author: song.author,
              thumbnail: song.thumbnail,
              type: ItemType.TRACK,
              length: song.duration,
              platform: Platform.SOUND_CLOUD,
              requester
            }),
          ],
        });
      }
    } catch (error) {
      await interaction.followUp(messages.failToPlay);
    }
  },
};
