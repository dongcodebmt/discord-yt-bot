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
} from '@/services'
import messages from '@/constants/messages';
import { Innertube, UniversalCache } from 'youtubei.js';
import { promises as fs } from 'fs';
import { JSDOM } from 'jsdom';
import { BG, BgConfig } from 'bgutils-js';

export class YoutubeService implements IMusicService {
  private innertube: Innertube | null | undefined;
  private redis: RedisService = new RedisService();
  private songCache: CacheSerivce = new CacheSerivce('yt:song', 24 * 60);
  private playlistCache: CacheSerivce = new CacheSerivce('yt:playlist', 24 * 60);
  private streamCache: CacheSerivce = new CacheSerivce('yt:stream', 5.5 * 60);

  private async createInnerTubeAsync(): Promise<Innertube> {
    if (!this.innertube) {
      const cookie = await fs.readFile(YOUTUBE_COOKIES_PATH, 'utf8');
      const { poTokenResult, visitorData } = await this.generateTokenAsync();
      this.innertube = await Innertube.create({
        cookie,
        po_token: poTokenResult.poToken,
        visitor_data: visitorData,
        cache: new UniversalCache(true),
        generate_session_locally: true
      });
    }
    return this.innertube;
  }

  public async getStreamURLAsync(song: ISong): Promise<string> {
    const cached = await this.redis.getAsync(this.streamCache.key(song.id));
    if (cached) return cached as string;

    const innertube = await this.createInnerTubeAsync();
    const streamData = await innertube.getStreamingData(song.id, {
      format: 'mp4',
      type: 'audio',
      quality: 'best',
      client: 'TV' 
    });
    if (!streamData.url) throw new Error(messages.unableGetStreamUrl);
    await this.redis.setAsync(this.streamCache.key(song.id), streamData.url, this.streamCache.ttl());
    return streamData.url!;
  }

  public async getPlaylistAsync(url: string): Promise<IPlaylist> {
    const playlistId = this.getPlaylistId(url) || url;
    const cached = await this.redis.getAsync(this.playlistCache.key(playlistId));
    if (cached) return await this.getPlaylistFromCacheAsync(cached as IPlaylistCache);

    const innertube = await this.createInnerTubeAsync();
    const response = await innertube.getPlaylist(playlistId);
    if (!response) throw new Error(messages.playlistNotFound);

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
        platform: Platform.YOUTUBE
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
    if (!response) throw new Error(messages.songNotFound);

    const song: ISong = {
      id: response.basic_info.id!,
      title: response.basic_info.title!,
      duration: response.basic_info.duration!,
      author: response.basic_info.author!,
      thumbnail: response.basic_info.thumbnail?.at(0)?.url!,
      url: this.getUrlFromId(response.basic_info.id!),
      platform: Platform.YOUTUBE
    };
    await this.redis.setAsync(this.songCache.key(song.id), song, this.songCache.ttl());
    return song;
  }

  public async searchAsync(query: string): Promise<ISong> {
    const innertube = await this.createInnerTubeAsync();
    const response = await innertube.search(query, { type: 'video' });
    if (response.results.length === 0) throw new Error(`${messages.searchNotFound} ${query}`);

    const video = response.results.at(0) as any;
    if (!video) throw new Error(`${messages.searchNotFound} ${query}`);

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

  private getPlaylistId(url: string): string | null | undefined {
    return url.match(youtubePlaylistRegex)?.[1];
  }

  private getVideoId(url: string): string | null | undefined {
    return url.match(youtubeVideoRegex)?.[1];
  }

  private async generateTokenAsync(): Promise<any> {
    // Create a barebones Innertube instance so we can get a visitor data string from YouTube.
    const innertube = await Innertube.create({ retrieve_player: false });

    const requestKey = 'O43z0dpjhgX20SCx4KAo';
    const visitorData = innertube.session.context.client.visitorData;

    if (!visitorData)
      throw new Error('Could not get visitor data');

    const dom = new JSDOM();

    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document
    });

    const bgConfig: BgConfig = {
      fetch: (input: string | URL | globalThis.Request, init?: RequestInit) => fetch(input, init),
      globalObj: globalThis,
      identifier: visitorData,
      requestKey
    };

    const bgChallenge = await BG.Challenge.create(bgConfig);

    if (!bgChallenge)
      throw new Error('Could not get challenge');

    const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;

    if (interpreterJavascript) {
      new Function(interpreterJavascript)();
    } else throw new Error('Could not load VM');

    const poTokenResult = await BG.PoToken.generate({
      program: bgChallenge.program,
      globalName: bgChallenge.globalName,
      bgConfig
    });

    return { poTokenResult, visitorData };
  }
}
