import {
  youtubePlaylistRegex,
  youtubeVideoRegex,
  soundCloudPlaylistRegex,
  soundCloudTrackRegex
} from '@/constants/regex'
import { IPlaylist, ISong, IMusicService } from '@/types';
import { Platform, MediaType } from '@/enums';
import { YoutubeService } from '@/services/youtube';
import { SoundCloudService } from '@/services/soundcloud';

export class MusicService {
  private youtube: YoutubeService = new YoutubeService();
  private soundcloud: SoundCloudService = new SoundCloudService();

  public getStreamURLAsync(song: ISong): Promise<string> {
    const plugin = this.getPluginByPlatform(song.platform);
    return plugin.getStreamURLAsync(song);
  }

  public getAsync(query: string, platform: Platform = Platform.YOUTUBE): Promise<IPlaylist | ISong> {
    const type = this.detectMediaType(query);
    const plugin = this.getPluginByMediaType(type, platform);

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

  private getPluginByPlatform(platform: Platform): IMusicService {
    switch (platform) {
      case Platform.SOUNDCLOUD:
        return this.soundcloud;
      case Platform.YOUTUBE:
      default:
        return this.youtube;
    }
  }

  private getPluginByMediaType(type: MediaType, platform: Platform = Platform.YOUTUBE): IMusicService {
    switch (type) {
      case MediaType.SoundCloudPlaylist:
      case MediaType.SoundCloudTrack:
        return this.soundcloud;
      case MediaType.YouTubePlaylist:
      case MediaType.YouTubeVideo:
        return this.youtube;
      case MediaType.Unknown:
      default:
        return platform == Platform.SOUNDCLOUD
          ? this.soundcloud
          : this.youtube;
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
