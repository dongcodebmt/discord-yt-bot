import { Song } from '@/types/Song';

export interface Playlist {
  title: string;
  thumbnail: string;
  author: string;
  songs: Song[];
}
