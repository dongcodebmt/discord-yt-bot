import { Playlist, Platform, IMusicService, Song } from '@/types';
import { YOUTUBE_COOKIES } from '@/constants/config';
import { YoutubeDlService } from "@/services";
import { Flags } from 'youtube-dl-exec';

export class YoutubeService implements IMusicService {
  private yt: YoutubeDlService;

  constructor() {
    const flags: Flags = {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      skipDownload: true,
      flatPlaylist: true,
      youtubeSkipDashManifest: true,
      geoBypass: true,
      quiet: true,
      ignoreErrors: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      ...(YOUTUBE_COOKIES ? { cookies: YOUTUBE_COOKIES } : {})
    };

    this.yt = new YoutubeDlService(flags);
  }

  public async getStreamURLAsync(url: string): Promise<string> {
    const result = await this.yt.exec(url, { format: 'bestaudio' }) as any;
    return result.url;
  }

  public async getPlaylistAsync(url: string): Promise<Playlist> {
    const result = await this.yt.exec(url) as any;
    if (!result.entries || result.entries.length === 0) throw new Error('Empty playlist');

    const songs: Song[] = result.entries.map((item: any) => (<Song>{
      title: item.title,
      duration: item.duration,
      author: item.uploader,
      thumbnail: item.thumbnails.at(0).url,
      url: item.url,
      platform: Platform.YOUTUBE
    }));

    return <Playlist>{
      title: result.title,
      thumbnail: result.thumbnails.at(0).url,
      author: result.uploader,
      songs
    };
  }

  public async getSongAsync(url: string): Promise<Song> {
    const result = await this.yt.exec(url) as any;
    if (!result) throw new Error('Not found');

    return <Song>{
      title: result.title,
      duration: result.duration,
      author: result.uploader,
      thumbnail: result.thumbnails.at(0).url,
      url: result.webpage_url,
      platform: Platform.YOUTUBE
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const limit = 1;
    const result = await this.yt.exec(`ytsearch${limit}:${query}`) as any;
    if (!result.entries || result.entries.length === 0) throw new Error('No search results');

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
}
