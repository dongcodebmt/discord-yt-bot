import { SoundCloudPlugin, SearchType } from '@distube/soundcloud';
import { Song as SoundCloudSong, Playlist as SoundCloudPlaylist } from 'distube';
import { soundCloudPlaylistRegex, soundCloudTrackRegex } from '@/constants/regex';
import { Playlist, Platform, Song, ItemType, IMusicService } from '@/types';

export class SoundCloudService implements IMusicService {
  private plugin: SoundCloudPlugin = new SoundCloudPlugin();

  public async getStreamURLAsync(url: string): Promise<string> {
    return this.plugin.getStreamURL(<SoundCloudSong>{ url });
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
    const result = await this.plugin.resolve(url, {});
    if (!(result instanceof SoundCloudPlaylist)) {
      throw new Error();
    }
    const songs: Song[] = (result as SoundCloudPlaylist).songs.map((item: any) => (
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
    const result = await this.plugin.resolve(url, {});
    if (!(result instanceof SoundCloudSong)) {
      throw new Error();
    }
    const song = result as SoundCloudSong;
    return <Song>{
      title: song.name,
      duration: song.duration,
      author: song.uploader.name,
      thumbnail: song.thumbnail,
      url: song.url,
      platform: Platform.SOUNDCLOUD
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const result = await this.plugin.search(query, SearchType.Track, 1 );
    if (result.length === 0) throw new Error();
    const item = result.at(0) as SoundCloudSong;
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
