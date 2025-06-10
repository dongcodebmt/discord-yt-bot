import { Playlist, Song } from "@/types";

export interface IMusicService {
  getStreamURLAsync: (url: string) => Promise<string>;
  getPlaylistAsync: (url: string) => Promise<Playlist>;
  getSongAsync: (url: string) => Promise<Song>;
  searchAsync: (query: string) => Promise<Song>;
}
