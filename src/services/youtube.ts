import { youtubePlaylistRegex, youtubeVideoRegex } from '@/constants/regex';
import { Playlist, Platform, Song, IMusicService } from '@/types';
import { YOUTUBE_COOKIES } from '@/constants/config';
import { youtubeDl, Flags } from 'youtube-dl-exec';

export class YoutubeService implements IMusicService {
  private flags: Flags = {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    preferFreeFormats: true,
    skipDownload: true,
    flatPlaylist: true,
    simulate: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  }

  constructor() {
    if (YOUTUBE_COOKIES) {
      this.flags = {...this.flags, cookies: YOUTUBE_COOKIES };
    }
  }

  public async getStreamURLAsync(url: string): Promise<string> {
    const result = await youtubeDl(url, { ...this.flags, format: 'bestaudio' }) as any;
    return result.url;
  }

  public async getAsync(query: string): Promise<Playlist | Song> {
    if (this.isPlaylist(query)) {
      return this.getPlaylistAsync(query);
    }
    if (this.isVideo(query)) {
      return this.getSongAsync(query);
    }
    return this.searchAsync(query);
  }

  public async getPlaylistAsync(url: string): Promise<Playlist> {
    const result = await youtubeDl(url, this.flags) as any;
    
    if (result.entries.length === 0) throw new Error();
    const songs: Song[] = result.entries.map((item: any) => (
      <Song>{
        title: item.title,
        duration: item.duration,
        author: item.uploader,
        thumbnail: item.thumbnails.at(0).url,
        url: item.url,
        platform: Platform.YOUTUBE
      }
    ));

    return <Playlist>{
      title: result.title,
      thumbnail: result.thumbnails.at(0).url,
      author: result.uploader,
      songs
    };
  }

  public async getSongAsync(url: string): Promise<Song> {
    const result = await youtubeDl(url, this.flags) as any;
    if (!result) throw new Error();
    return <Song>{
      title: result.title,
      duration: result.duration,
      author: result.uploader,
      thumbnail: result.thumbnails.at(0).url,
      url: result.original_url,
      platform: Platform.YOUTUBE
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const limit = 1;
    const result = await youtubeDl(`ytsearch${limit}:${query}`, this.flags) as any;
    if (result.entries.length === 0) throw new Error();
    const item = result.entries.at(0);
    return <Song>{
      title: item.title,
      duration: item.duration,
      author: item.uploader,
      thumbnail: item.thumbnails.at(0).url,
      url: item.url,
      platform: Platform.YOUTUBE
    };
  }

  private isPlaylist(url: string): boolean {
    const paths = url.match(youtubePlaylistRegex);
    return paths != null;
  }

  private isVideo(url: string): boolean {
    const paths = url.match(youtubeVideoRegex);
    return paths != null;
  }
}
