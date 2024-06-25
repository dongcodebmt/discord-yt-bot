import { SoundCloudPlugin, SearchType } from '@distube/soundcloud';
import { Song as SoundCloudSong, Playlist as SoundCloudPlaylist } from 'distube';
import { soundCloudPlaylistRegex, soundCloudTrackRegex } from '@/constants/regex';
import { Playlist, Platform, Song, ItemType } from '@/types';

export class SoundCloudService {
  private plugin: SoundCloudPlugin = new SoundCloudPlugin();

  public async getStream(url: string): Promise<string> {
    return this.plugin.getStreamURL(<SoundCloudSong>{ url });
  }

  public async getResult(content: string): Promise<Playlist | Song> {
    if (this.isPlaylist(content)) {
      return this.getPlaylist(content);
    }
    if (this.isTrack(content)) {
      return this.getSong(content);
    }
    return this.searchSong(content);
  }

  public async getPlaylist(url: string): Promise<Playlist> {
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
        platform: Platform.SOUND_CLOUD
      }
    ));
    return <Playlist> {
      title: result.name,
      thumbnail: result.thumbnail,
      author: ItemType.PLAYLIST,
      songs
    };
  }

  public async getSong(url: string): Promise<Song> {
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
      platform: Platform.SOUND_CLOUD
    };
  }

  public async searchSong(keyword: string): Promise<Song> {
    const result = await this.plugin.search(keyword, SearchType.Track, 1 );
    if (result.length === 0) throw new Error();
    const item = result.at(0) as SoundCloudSong;
    return <Song> {
      title: item.name,
      duration: item.duration,
      author: item.uploader.name,
      thumbnail: item.thumbnail,
      url: item.url,
      platform: Platform.YOUTUBE
    };
  }

  public isPlaylist(url: string): boolean {
    const paths = url.match(soundCloudPlaylistRegex);
    return paths != null;
  }
  
  public isTrack(url: string): boolean {
    const paths = url.match(soundCloudTrackRegex);
    return paths != null;
  }
}
