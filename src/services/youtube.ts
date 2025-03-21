import { youtubePlaylistRegex, youtubeVideoRegex } from '@/constants/regex';
import { Playlist, Platform, Song, IMusicService } from '@/types';
import { YOUTUBE_COOKIES } from '@/constants/config';
import { youtubeDl, Flags } from 'youtube-dl-exec';

export class YoutubeService implements IMusicService {
  private flags: Flags = {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    skipDownload: true,
    flatPlaylist: true,
    youtubeSkipDashManifest: true,
    geoBypass: true,
    quiet: true,
    ignoreErrors: true,
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
    const playlistId = this.getPlaylistId(query);
    if (playlistId) {
      return this.getPlaylistAsync(playlistId);
    }
    const videoId = this.getVideoId(query);
    if (videoId) {
      return this.getSongAsync(videoId);
    }
    return this.searchAsync(query);
  }

  private async getPlaylistAsync(id: string): Promise<Playlist> {
    const result = await youtubeDl(id, this.flags) as any;
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

  private async getSongAsync(id: string): Promise<Song> {
    const result = await youtubeDl(id, this.flags) as any;
    if (!result) throw new Error();

    return <Song>{
      title: result.title,
      duration: result.duration,
      author: result.uploader,
      thumbnail: result.thumbnails.at(0).url,
      url: result.webpage_url,
      platform: Platform.YOUTUBE
    };
  }

  private async searchAsync(query: string): Promise<Song> {
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

  private getPlaylistId(url: string): string | undefined {
    const match = url.match(youtubePlaylistRegex);
    return match ? match[1] : undefined;
  }

  private getVideoId(url: string): string | undefined {
    const match = url.match(youtubeVideoRegex);
    return match ? match[1] : undefined;
  }
}
