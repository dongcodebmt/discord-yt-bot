import { Playlist, Song, IMusicService, Platform } from '@/types';
import { YoutubeService } from '@/services/youtube';
import { SoundCloudService } from '@/services/soundcloud';

export class MusicService implements IMusicService {
  private plugin: IMusicService;

  constructor(platform: Platform = Platform.YOUTUBE) {
    this.plugin = this.createPlugin(platform);
  }

  public getStreamURLAsync(url: string): Promise<string> {
    return this.plugin.getStreamURLAsync(url);
  }

  public getAsync(query: string): Promise<Playlist | Song> {
    return this.plugin.getAsync(query);
  }

  private createPlugin(platform: Platform): IMusicService {
    switch (platform) {
      case Platform.SOUNDCLOUD:
        return new SoundCloudService();
      case Platform.YOUTUBE:
      default:
        return new YoutubeService();
    }
  }
}
