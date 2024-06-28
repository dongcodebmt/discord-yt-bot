import { Playlist, Song } from "@/types";

export interface IMusicService {
  getStreamURLAsync: (url: string) => Promise<string>;
  getAsync: (query: string) => Promise<Playlist | Song>;
  searchAsync: (query: string) => Promise<Song>;
  getPlaylistAsync: (url: string) => Promise<Playlist>;
  getSongAsync: (url: string) => Promise<Song>;
}
