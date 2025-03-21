import { soundCloudPlaylistRegex, soundCloudTrackRegex } from '@/constants/regex';
import { Playlist, Platform, Song, IMusicService } from '@/types';
import { youtubeDl, Flags } from 'youtube-dl-exec';

export class SoundCloudService implements IMusicService {
  private flags: Flags = {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    skipDownload: true,
    quiet: true,
    ignoreErrors: true,
    addHeader: ['Referer:soundcloud.com', 'user-agent:googlebot']
  }

  public async getStreamURLAsync(url: string): Promise<string> {
    const result = await youtubeDl(url, this.flags) as any;
    return result.url;
  }

  public async getAsync(query: string): Promise<Playlist | Song> {
    if (this.isPlaylist(query)) {
      return this.getPlaylistAsync(query);
    }
    if (this.isTrack(query)) {
      return this.getSongAsync(query);
    }
    return this.searchAsync(query);
  }

  private async getPlaylistAsync(url: string): Promise<Playlist> {
    const result = await youtubeDl(url, this.flags) as any;

    if (result.entries.length === 0) throw new Error();

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

  private async getSongAsync(url: string): Promise<Song> {
    const result = await youtubeDl(url, this.flags) as any;
    if (!result) throw new Error();

    return <Song>{
      title: result.title,
      duration: result.duration,
      author: result.uploader,
      thumbnail: result.thumbnail,
      url: result.webpage_url,
      platform: Platform.SOUNDCLOUD
    };
  }

  private async searchAsync(query: string): Promise<Song> {
    const limit = 1;
    const result = await youtubeDl(`scsearch:${limit}:${query}`, this.flags) as any;
    if (result.entries.length === 0) throw new Error();
    
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

  private isPlaylist(url: string): boolean {
    const paths = url.match(soundCloudPlaylistRegex);
    return paths != null;
  }
  
  private isTrack(url: string): boolean {
    const paths = url.match(soundCloudTrackRegex);
    return paths != null;
  }
}
