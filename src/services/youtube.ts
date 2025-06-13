import { Platform } from '@/enums';
import {
  IMusicService,
  IPlaylist,
  IPlaylistCache,
  ISong
} from '@/types';
import {
  youtubePlaylistRegex,
  youtubeVideoRegex
} from '@/constants/regex'
import {
  YOUTUBE_COOKIES_PATH
} from '@/constants/config';
import { timeStringToSeconds } from '@/utils';
import {
  CacheSerivce,
  RedisService
} from "@/services"
import { Innertube } from 'youtubei.js';
import { YoutubeDlService } from "@/services"
import { Flags } from 'youtube-dl-exec';

export class YoutubeService implements IMusicService {
  private ytdl: YoutubeDlService;
  private redis: RedisService = new RedisService();
  private songCache: CacheSerivce = new CacheSerivce('yt:song', 24 * 60);
  private playlistCache: CacheSerivce = new CacheSerivce('yt:playlist', 24 * 60);
  private streamCache: CacheSerivce = new CacheSerivce('yt:stream', 5.5 * 60);

  constructor() {
    const flags: Flags = {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      skipDownload: true,
      flatPlaylist: true,
      youtubeSkipDashManifest: true,
      geoBypass: true,
      quiet: true,
      ignoreErrors: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      ...(YOUTUBE_COOKIES_PATH ? { cookies: YOUTUBE_COOKIES_PATH } : {})
    };
    this.ytdl = new YoutubeDlService(flags);
  }

  private async createInnerTubeAsync(): Promise<Innertube> {
    return await Innertube.create();
  }

  public async getStreamURLAsync(song: ISong): Promise<string> {
    const cached = await this.redis.getAsync(this.streamCache.key(song.id));
    if (cached) return cached as string;

    // TODO switch to Innertube
    const result = await this.ytdl.exec(song.id, { format: 'bestaudio' }) as any;
    const playbackUrl = result.url;
    await this.redis.setAsync(this.streamCache.key(song.id), playbackUrl, this.streamCache.ttl());
    return playbackUrl;
  }

  public async getPlaylistAsync(url: string): Promise<IPlaylist> {
    const playlistId = this.getPlaylistId(url) || url;
    const cached = await this.redis.getAsync(this.playlistCache.key(playlistId));
    if (cached) return await this.getPlaylistFromCacheAsync(cached as IPlaylistCache);

    const innertube = await this.createInnerTubeAsync();
    const response = await innertube.getPlaylist(playlistId);
    if (!response) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist: IPlaylistCache = {
      id: playlistId,
      title: response.info.title!,
      thumbnail: response.info.thumbnails?.at(0)?.url!,
      author: response.info.author.name!,
      ids: []
    };

    // TODO: response.getContinuation(), response.getContinuationData ???
    const songs: ISong[] = response.items.map((item: any) => (
      <ISong>{
        id: item.id,
        title: item.title.text,
        duration: item.duration.seconds,
        author: item.author.name,
        thumbnail: item.thumbnails.at(0).url,
        url: this.getUrlFromId(item.id),
        platform: Platform.SOUNDCLOUD
      }
    ));

    for (const song of songs) {
      playlist.ids.push(song.id);
      await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    }
    await this.redis.setAsync(this.playlistCache.key(playlist.id), playlist, this.playlistCache.ttl());
    return await this.getPlaylistFromCacheAsync(playlist);
  }

  public async getSongAsync(url: string): Promise<ISong> {
    const videoId = this.getVideoId(url) || url;
    const cached = await this.redis.getAsync(this.songCache.key(videoId));
    if (cached) return cached as ISong;

    const innertube = await this.createInnerTubeAsync();
    const response = await innertube.getBasicInfo(videoId);

    if (!response) throw new Error('VIDEO_NOT_FOUND');

    const song: ISong = {
      id: response.basic_info.id!,
      title: response.basic_info.title!,
      duration: response.basic_info.duration!,
      author: response.basic_info.author!,
      thumbnail: response.basic_info.thumbnail?.at(0)?.url!,
      url: this.getUrlFromId(response.basic_info.id!),
      platform: Platform.SOUNDCLOUD
    };
    await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    return song;
  }

  public async searchAsync(query: string): Promise<ISong> {
    const innertube = await this.createInnerTubeAsync();
    const response = await innertube.search(query, { type: 'video' });
    if (response.results.length === 0) throw new Error('NO_SEARCH_RESULTS');

    const video = response.results.at(0) as any;
    if (!video) throw new Error('NO_SEARCH_RESULTS');

    const song: ISong = {
      id: video.video_id,
      title: video.title.text,
      duration: timeStringToSeconds(video.length_text.text),
      author: video.author.name,
      thumbnail: video.thumbnails.at(0).url,
      url: this.getUrlFromId(video.video_id),
      platform: Platform.YOUTUBE
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

  private getUrlFromId(id: string): string {
    return `https://youtu.be/${id}`;
  }

  private getPlaylistId(url: string): string | undefined {
    return url.match(youtubePlaylistRegex)?.[1];
  }

  private getVideoId(url: string): string | undefined {
    return url.match(youtubeVideoRegex)?.[1];
  }
}
