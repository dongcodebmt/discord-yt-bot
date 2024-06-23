import {
  BOT_LOGO,
  BOT_NAME,
  MESSAGE_EMBED_COLOR,
  PLATFORM,
} from '@/constants/config';
import messages from '@/constants/messages';
import { Platform } from '@/types/Platform';
import { formatSeconds } from '@/utils';
import { APIEmbedField, EmbedBuilder } from 'discord.js';

export const createPlayMessage = (payload: {
  title: string;
  url: string;
  author: string;
  thumbnail: string;
  type: 'Song' | 'Playlist';
  length: number;
  platform: Platform;
  requester: string;
}): EmbedBuilder => {
  const author: APIEmbedField = {
    name: messages.author,
    value: payload.author,
    inline: true,
  };
  const length: APIEmbedField = {
    name: messages.length,
    value:
      payload.type === 'Playlist'
        ? payload.length.toString()
        : formatSeconds(payload.length),
    inline: true,
  };
  const type: APIEmbedField = {
    name: messages.type,
    value: payload.type,
    inline: true,
  };
  return new EmbedBuilder()
    .setColor(MESSAGE_EMBED_COLOR)
    .setTitle(payload.title)
    .setURL(payload.url)
    .setAuthor({
      name: `${messages.addedToQueue} ${payload.requester}`,
      url: PLATFORM[payload.platform].uri
    })
    .setThumbnail(payload.thumbnail)
    .addFields(author, length, type)
    .setFooter({ text: BOT_NAME, iconURL: BOT_LOGO });
};
