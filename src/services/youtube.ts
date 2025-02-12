import { youtubePlaylistRegex, youtubeVideoRegex } from '@/constants/regex';
import { Playlist, Platform, Song, ItemType, IMusicService } from '@/types';
import { YouTubePlugin, YouTubePluginOptions, YouTubePlaylist, YouTubeSong, SearchResultType, YouTubeSearchResultSong } from '@distube/youtube';
import { YOUTUBE_COOKIES } from '@/constants/config';

export class YoutubeService implements IMusicService {
  private plugin: YouTubePlugin = new YouTubePlugin();

  constructor() {
    let options: YouTubePluginOptions = {
      ytdlOptions: {
        // playerClients: ["IOS", "WEB_CREATOR"]
      }
    };
    if (YOUTUBE_COOKIES.length > 0) {
      options.cookies = YOUTUBE_COOKIES
    }
    this.plugin = new YouTubePlugin(options);
  }
  
  public async getStreamURLAsync(url: string): Promise<string> {
    return this.plugin.getStreamURL(<YouTubeSong>{ url });
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
    const result = await this.plugin.resolve(url, {});
    if (!(result instanceof YouTubePlaylist)) {
      throw new Error();
    }
    const songs: Song[] = result.songs.map(item => (
      <Song> {
        title: item.name,
        duration: item.duration,
        author: item.uploader.name,
        thumbnail: item.thumbnail,
        url: item.url, 
        platform: Platform.YOUTUBE
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
    if (!(result instanceof YouTubeSong)) {
      throw new Error();
    }
    return <Song> {
      title: result.name,
      duration: result.duration,
      author: result.uploader.name,
      thumbnail: result.thumbnail,
      url: result.url,
      platform: Platform.YOUTUBE
    };
  }

  public async searchAsync(query: string): Promise<Song> {
    const result = await this.plugin.search(query, { type: SearchResultType.VIDEO, limit: 1 });
    if (result.length === 0) throw new Error();
    const item = result.at(0) as YouTubeSearchResultSong;
    return <Song> {
      title: item.name,
      duration: item.duration,
      author: item.uploader.name,
      thumbnail: item.thumbnail,
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
