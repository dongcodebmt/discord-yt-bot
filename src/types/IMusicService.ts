import { IPlaylist, ISong } from '@/types';

export interface IMusicService {
  getStreamURLAsync: (song: ISong) => Promise<string>;
  getPlaylistAsync: (url: string) => Promise<IPlaylist>;
  getSongAsync: (url: string) => Promise<ISong>;
  searchAsync: (query: string) => Promise<ISong>;
}
