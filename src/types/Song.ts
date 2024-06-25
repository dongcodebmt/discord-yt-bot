import { Platform } from '@/types';

export interface Song {
  title: string;
  duration: number;
  author: string;
  thumbnail: string;
  url: string;
  platform: Platform;
}
