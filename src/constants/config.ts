import { Colors } from 'discord.js';
import { Platform } from '@/enums';
import fs from 'fs';
import * as path from 'path';

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const BOT_LANG = process.env.BOT_LANG ?? 'en';
export const REDIS_URL = process.env.REDIS_URL;
export const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
export const SOUNDCLOUD_OAUTH_TOKEN = process.env.SOUNDCLOUD_OAUTH_TOKEN;
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
export const YOUTUBE_COOKIES_PATH = path.join(process.cwd(), 'cookies.txt');
