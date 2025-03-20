import { Playlist, Song, IMusicService, Platform } from '@/types';
import { YoutubeService } from '@/services/youtube';
import { SoundCloudService } from '@/services/soundcloud';

export class MusicService implements IMusicService {
  private plugin: IMusicService;
  constructor(platform: Platform = Platform.YOUTUBE) {
    if (platform === Platform.SOUNDCLOUD) {
      this.plugin = new SoundCloudService();
    } else {
      this.plugin = new YoutubeService();
    }
  }

  public async getStreamURLAsync(url: string): Promise<string> {
    return this.plugin.getStreamURLAsync(url);
  }
  public async getAsync(query: string): Promise<Playlist | Song> {
    return this.plugin.getAsync(query);
  }
}