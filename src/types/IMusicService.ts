import { Playlist, Song } from "@/types";

export interface IMusicService {
  getStreamURLAsync: (url: string) => Promise<string>;
  getAsync: (query: string) => Promise<Playlist | Song>;
}
