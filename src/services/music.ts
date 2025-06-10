import {
  youtubePlaylistRegex,
  youtubeVideoRegex,
  soundCloudPlaylistRegex,
  soundCloudTrackRegex
} from '@/constants/regex'
import { Playlist, Song, IMusicService, Platform, MediaType } from '@/types';
import { YoutubeService } from '@/services/youtube';
import { SoundCloudService } from '@/services/soundcloud';

export class MusicService {
  private platformSelected: Platform;

  constructor(platform: Platform = Platform.YOUTUBE) {
    this.platformSelected = platform;
  }

  public getStreamURLAsync(song: Song): Promise<string> {
    const plugin = this.createPluginByPlatform(song.platform);
    return plugin.getStreamURLAsync(song.url);
  }

  public getAsync(query: string): Promise<Playlist | Song> {
    const type = this.detectMediaType(query);
    const plugin = this.createPluginByMediaType(type);

    switch (type) {
      case MediaType.SoundCloudPlaylist:
      case MediaType.YouTubePlaylist:
        return plugin.getPlaylistAsync(query);
      case MediaType.SoundCloudTrack:
      case MediaType.YouTubeVideo:
        return plugin.getSongAsync(query);
      case MediaType.Unknown:
      default:
        return plugin.searchAsync(query);
    }
  }

  private createPluginByPlatform(platform: Platform): IMusicService {
    switch (platform) {
      case Platform.SOUNDCLOUD:
        return new SoundCloudService();
      case Platform.YOUTUBE:
      default:
        return new YoutubeService();
    }
  }

  private createPluginByMediaType(type: MediaType): IMusicService {
    switch (type) {
      case MediaType.SoundCloudPlaylist:
      case MediaType.SoundCloudTrack:
        return new SoundCloudService();
      case MediaType.YouTubePlaylist:
      case MediaType.YouTubeVideo:
        return new YoutubeService();
      case MediaType.Unknown:
      default:
        return this.platformSelected == Platform.SOUNDCLOUD ? new SoundCloudService() : new YoutubeService();
    }
  }

  private detectMediaType(url: string): MediaType {
    if (youtubePlaylistRegex.test(url)) {
      return MediaType.YouTubePlaylist;
    } else if (youtubeVideoRegex.test(url)) {
      return MediaType.YouTubeVideo;
    } else if (soundCloudPlaylistRegex.test(url)) {
      return MediaType.SoundCloudPlaylist;
    } else if (soundCloudTrackRegex.test(url)) {
      return MediaType.SoundCloudTrack;
    }
    return MediaType.Unknown;
  }
}
