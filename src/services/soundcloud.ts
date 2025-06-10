import { Playlist, Platform, IMusicService, Song } from '@/types';
import { YoutubeDlService } from "@/services"
import { Flags } from 'youtube-dl-exec';

export class SoundCloudService implements IMusicService {
  private yt: YoutubeDlService;

  constructor() {
    const flags: Flags = {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      skipDownload: true,
      quiet: true,
      ignoreErrors: true,
      addHeader: ['Referer:soundcloud.com', 'user-agent:googlebot']
    };

    this.yt = new YoutubeDlService(flags);
  }

  public async getStreamURLAsync(url: string): Promise<string> {
    const result = await this.yt.exec(url);
    return result.url;
  }

  public async getPlaylistAsync(url: string): Promise<Playlist> {
    const result = await this.yt.exec(url);

    if (result.entries.length === 0) throw new Error('Empty playlist');

    const songs: Song[] = result.entries.map((item: any) => (
      <Song>{
        title: item.title,
        duration: item.duration,
        author: item.uploader,
        thumbnail: item.thumbnail,
        url: item.webpage_url,
        platform: Platform.SOUNDCLOUD
      }
    ));

    return <Playlist>{
      title: result.title,
      thumbnail: songs.at(0)?.thumbnail,
      author: result.uploader,
      songs
    };
  }

  public async getSongAsync(url: string): Promise<Song> {
    const result = await this.yt.exec(url);
    if (!result) throw new Error('Not found');

    return <Song>{
      title: result.title,
      duration: result.duration,
      author: result.uploader,
      thumbnail: result.thumbnail,
      url: result.webpage_url,
      platform: Platform.SOUNDCLOUD
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const limit = 1;
    const result = await this.yt.exec(`scsearch:${limit}:${query}`);
    if (result.entries.length === 0) throw new Error('No search results');

    const item = result.entries.at(0);
    return <Song>{
      title: item.title,
      duration: item.duration,
      author: item.uploader,
      thumbnail: item.thumbnail,
      url: item.webpage_url,
      platform: Platform.SOUNDCLOUD
    };
  }
}
