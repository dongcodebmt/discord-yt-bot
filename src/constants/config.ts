import { Colors, ActivityType, ActivityOptions } from 'discord.js';
import { Platform } from '@/types';
import fs from 'fs';
import * as path from 'path';

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const BOT_LANG = process.env.BOT_LANG ?? 'en';
export const CMD_PREFLIX = '/';
export const MESSAGE_EMBED_COLOR = Colors.Red;

export const SOUNDCLOUD_LOGO = 'https://res.cloudinary.com/dumfvnj9f/image/upload/v1621607196/misabot-discord/soundcloud_kfwdtz.png';
export const YOUTUBE_LOGO = 'https://res.cloudinary.com/dumfvnj9f/image/upload/v1621607197/misabot-discord/youtube_af1h05.png';
export const PLATFORM = {
  [Platform.YOUTUBE]: {
    uri: YOUTUBE_LOGO,
    name: 'Youtube',
  },
  [Platform.SOUNDCLOUD]: {
    uri: SOUNDCLOUD_LOGO,
    name: 'SoundCloud',
  },
};
export const BOT_NAME = 'DongDev Bot';
export const BOT_LOGO = 'https://www.dongdev.com/static/img/favicon.png';
export const BAD_WORDS = fs.existsSync('badwords.json') ? JSON.parse(fs.readFileSync(path.join(process.cwd(), 'badwords.json'), 'utf-8')) : [];
export const YOUTUBE_COOKIES = path.join(process.cwd(), 'cookies.txt');
export const BOT_DEFAULT_ACTIVITY: ActivityOptions = {
  name: `music | ${CMD_PREFLIX}help`,
  type: ActivityType.Playing
};