import { SoundCloudPlugin, SearchType } from '@distube/soundcloud';
import { soundCloudPlaylistRegex, soundCloudTrackRegex } from '@/constants/regex';
import { Playlist, Platform, Song, ItemType, IMusicService } from '@/types';

export class SoundCloudService implements IMusicService {
  private plugin: SoundCloudPlugin = new SoundCloudPlugin();

  public async getStreamURLAsync(url: string): Promise<string> {
    return this.plugin.getStreamURL({ url } as any);
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

  public async getPlaylistAsync(url: string): Promise<Playlist> {
    const result = await this.plugin.resolve(url, {}) as any;
    if (!result.songs) {
      throw new Error();
    }
    const songs: Song[] = result.songs.map((item: any) => (
      <Song> {
        title: item.name,
        duration: item.duration,
        author: item.uploader.name,
        thumbnail: item.thumbnail,
        url: item.url, 
        platform: Platform.SOUNDCLOUD
      }
    ));
    return <Playlist> {
      title: result.name,
      thumbnail: result.thumbnail,
      author: ItemType.PLAYLIST,
      songs
    };
  }

  public async getSongAsync(url: string): Promise<Song> {
    const result = await this.plugin.resolve(url, {}) as any;
    return <Song>{
      title: result.name,
      duration: result.duration,
      author: result.uploader.name,
      thumbnail: result.thumbnail,
      url: result.url,
      platform: Platform.SOUNDCLOUD
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const result = await this.plugin.search(query, SearchType.Track, 1 );
    if (result.length === 0) throw new Error();
    const item = result.at(0) as any;
    return <Song> {
      title: item.name,
      duration: item.duration,
      author: item.uploader.name,
      thumbnail: item.thumbnail,
      url: item.url,
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
