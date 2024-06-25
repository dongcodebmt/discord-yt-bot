import { ApplicationCommandData } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import messages from '@/constants/messages';

export const schema: ApplicationCommandData[] = [
  {
    name: 'play',
    description: messages.playDescription,
    options: [
      {
        name: 'input',
        type: ApplicationCommandOptionType.String,
        description: messages.inputPlayDescription,
        required: true,
      },
    ],
  },
  {
    name: 'skip',
    description: messages.skipDescription,
  },
  {
    name: 'queue',
    description: messages.queueDescription,
  },
  {
    name: 'pause',
    description: messages.pauseDescription,
  },
  {
    name: 'resume',
    description: messages.resumeDescription,
  },
  {
    name: 'nowplaying',
    description: messages.nowPlayingDescription,
  },
  {
    name: 'shuffle',
    description: messages.shuffleDescription,
  },
  {
    name: 'jump',
    description: messages.jumpDescription,
    options: [
      {
        name: 'position',
        type: ApplicationCommandOptionType.Number,
        description: messages.jumpPostionDescription,
        required: true,
      },
    ],
  },
  {
    name: 'remove',
    description: messages.removeDescription,
    options: [
      {
        name: 'position',
        type: ApplicationCommandOptionType.Number,
        description: messages.removePostionDescription,
        required: true,
      },
    ],
  },
  {
    name: 'ping',
    description: messages.pingDescription,
  },
  {
    name: 'leave',
    description: messages.leaveDescription,
  },
  {
    name: 'help',
    description: messages.helpDescription,
  },
  {
    name: 'soundcloud',
    description: messages.soundcloudDescription,
    options: [
      {
        name: 'input',
        type: ApplicationCommandOptionType.String,
        description: messages.inputSoundcloudDescription,
        required: true,
      },
    ],
  },
];
