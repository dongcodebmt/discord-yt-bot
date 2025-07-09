import { Platform } from '@/enums';
import {
  IMusicService,
  IPlaylist,
  IPlaylistCache,
  ISong
} from '@/types';
import {
  soundCloudPlaylistRegex,
  soundCloudTrackRegex
} from '@/constants/regex'
import {
  SOUNDCLOUD_CLIENT_ID,
  SOUNDCLOUD_OAUTH_TOKEN
} from '@/constants/config';
import {
  CacheSerivce,
  RedisService
} from '@/services'
import messages from '@/constants/messages';
import { Soundcloud, SoundcloudTrack } from 'soundcloud.ts';

export class SoundCloudService implements IMusicService {
  private soundcloud: Soundcloud = new Soundcloud(SOUNDCLOUD_CLIENT_ID, SOUNDCLOUD_OAUTH_TOKEN);
  private redis: RedisService = new RedisService();
  private songCache: CacheSerivce = new CacheSerivce('sc:song', 24 * 60);
  private playlistCache: CacheSerivce = new CacheSerivce('sc:playlist', 24 * 60);
  private streamCache: CacheSerivce = new CacheSerivce('sc:stream', 30);

  public async getStreamURLAsync(song: ISong): Promise<string> {
    const cached = await this.redis.getAsync(this.streamCache.key(song.id));
    if (cached) return cached as string;

    const streamUrl = await this.soundcloud.util.streamLink(song.url);
    if (!streamUrl) throw new Error(messages.unableGetStreamUrl);
    await this.redis.setAsync(this.streamCache.key(song.id), streamUrl, this.streamCache.ttl());
    return streamUrl;
  }

  public async getPlaylistAsync(url: string): Promise<IPlaylist> {
    const playlistId = this.getPlaylistId(url) || url;
    const cached = await this.redis.getAsync(this.playlistCache.key(playlistId));
    if (cached) return await this.getPlaylistFromCacheAsync(cached as IPlaylistCache);

    const result = await this.soundcloud.playlists.getAlt(url);
    if (result.tracks.length === 0) throw new Error(messages.playlistNotFound);

    const songs: ISong[] = result.tracks.map((item: SoundcloudTrack) => (
      <ISong>{
        id: this.getTrackId(item.permalink_url) ?? item.permalink_url,
        title: item.title,
        duration: item.duration / 1000,
        author: item.user.full_name,
        thumbnail: item.artwork_url,
        url: item.permalink_url,
        platform: Platform.SOUNDCLOUD
      }
    ));

    const playlist: IPlaylistCache = {
      id: this.getPlaylistId(result.permalink_url) ?? result.permalink_url,
      title: result.title,
      thumbnail: result.artwork_url ?? songs.at(0)?.thumbnail ?? '',
      author: result.user.full_name,
      ids: []
    };
    for (const song of songs) {
      playlist.ids.push(song.id);
      await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    }
    await this.redis.setAsync(this.playlistCache.key(playlist.id), playlist, this.playlistCache.ttl());
    return await this.getPlaylistFromCacheAsync(playlist);
  }

  public async getSongAsync(url: string): Promise<ISong> {
    const trackId = this.getTrackId(url) || url;
    const cached = await this.redis.getAsync(this.songCache.key(trackId));
    if (cached) return cached as ISong;

    const result = await this.soundcloud.tracks.get(url);
    if (!result) throw new Error(messages.songNotFound);

    const song: ISong = {
      id: this.getTrackId(result.permalink_url) ?? result.permalink_url,
      title: result.title,
      duration: result.duration / 1000,
      author: result.user.full_name,
      thumbnail: result.artwork_url,
      url: result.permalink_url,
      platform: Platform.SOUNDCLOUD
    };
    await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    return song;
  }

  public async searchAsync(query: string): Promise<ISong> {
    const result = await this.soundcloud.tracks.search({ q: query, limit: 1 });
    if (result.collection.length === 0) throw new Error(`${messages.searchNotFound} ${query}`);

    const track = result.collection.at(0);
    if (!track) throw new Error(`${messages.searchNotFound} ${query}`);

    const song: ISong = {
      id: this.getTrackId(track.permalink_url) ?? track.permalink_url,
      title: track.title,
      duration: track.duration,
      author: track.user.full_name,
      thumbnail: track.artwork_url,
      url: track.permalink_url,
      platform: Platform.SOUNDCLOUD
    };
    await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    return song;
  }

  private async getPlaylistFromCacheAsync(cached: IPlaylistCache): Promise<IPlaylist> {
    const playlist: IPlaylist = { ...cached, songs: [] };
    for (const id of cached.ids) {
      playlist.songs.push(await this.getSongAsync(id));
    }
    return playlist;
  }

  private getPlaylistId(url: string): string | null | undefined {
    const match = url.match(soundCloudPlaylistRegex);
    return match ? `${match[2]}/sets/${match[3]}` : null;
  }

  private getTrackId(url: string): string | null | undefined {
    return url.match(soundCloudTrackRegex)?.[2];
  }
}
