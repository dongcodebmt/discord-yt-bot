import { Song } from '@/types';

export interface Playlist {
  title: string;
  thumbnail: string;
  author: string;
  songs: Song[];
}
