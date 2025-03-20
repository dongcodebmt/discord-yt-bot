import { servers } from '@/servers';
import { QueueItem } from '@/types';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus
} from '@discordjs/voice';
import { Client, ActivityType, ActivityOptions } from 'discord.js';
import { shuffle } from '@/utils';
import { MusicService, DiscordStream } from '@/services';
import { BOT_DEFAULT_ACTIVITY } from '@/constants/config';

export class Server {
  public guildId: string;
  public playing?: QueueItem;
  public queue: QueueItem[];
  public readonly voiceConnection: VoiceConnection;
  public readonly audioPlayer: AudioPlayer;
  private client: Client;
  private isReady = false;

  constructor(voiceConnection: VoiceConnection, guildId: string, client: Client) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.playing = undefined;
    this.guildId = guildId;
    this.client = client;

    this.voiceConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        /*
          If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
          but there is a chance the connection will recover itself if the reason of the disconnect was due to
          switching voice channels. This is also the same code for the bot being kicked from the voice channel,
          so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
          the voice connection.
        */
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              5_000,
            );
          } catch (e) {
            this.leave();
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          this.voiceConnection.rejoin();
        } else {
          this.leave();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.leave();
      } else if (
        !this.isReady &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
        /*
          In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
          before destroying the voice connection. This stops the voice connection permanently existing in one of these
          states.
        */
        this.isReady = true;
        try {
          await entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Ready,
            20_000,
          );
        } catch {
          if (
            this.voiceConnection.state.status !==
            VoiceConnectionStatus.Destroyed
          )
            this.voiceConnection.destroy();
        } finally {
          this.isReady = false;
        }
      }
    });

    // Configure audio player
    this.audioPlayer.on('stateChange', async (oldState, newState) => {
      this.setActivity(newState.status === AudioPlayerStatus.Playing ? this.getCurrentActivity() : undefined);
      
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        await this.play();
      }
    });

    voiceConnection.subscribe(this.audioPlayer);
  }

  public async addSongs(queueItems: QueueItem[]): Promise<void> {
    this.queue = this.queue.concat(queueItems);
    if (!this.playing) {
      await this.play();
    }
  }

  public stop(): void {
    this.playing = undefined;
    this.queue = [];
    this.audioPlayer.stop();
  }

  public leave(): void {
    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      this.voiceConnection.destroy();
    }
    this.stop();
    servers.delete(this.guildId);
  }

  public pause(): void {
    this.audioPlayer.pause();
  }

  public resume(): void {
    this.audioPlayer.unpause();
  }

  public async jump(position: number): Promise<QueueItem> {
    const target = this.queue[position - 1];
    this.queue = this.queue
      .splice(0, position - 1)
      .concat(this.queue.splice(position, this.queue.length - 1));
    this.queue.unshift(target);
    await this.play();
    return target;
  }

  public remove(position: number): QueueItem {
    return this.queue.splice(position - 1, 1)[0];
  }

  public shuffle(): void {
    this.queue = shuffle(this.queue);
  }

  public async play(): Promise<void> {
    try {
      if (this.queue.length <= 0) {
        this.playing = undefined;
        this.audioPlayer.stop();
        return;
      }
      this.playing = this.queue.shift() as QueueItem;
      const service: MusicService = new MusicService(this.playing.song.platform);
      const streamUrl = await service.getStreamURLAsync(this.playing.song.url);
      const stream: any = new DiscordStream(streamUrl);
      this.audioPlayer.play(stream.audioResource);
      stream.spawn();
    } catch (e) {
      this.play();
    }
  }

  private setActivity(opts: ActivityOptions = BOT_DEFAULT_ACTIVITY): void {
    this.client.user?.setActivity(opts);
  }

  private getCurrentActivity(): ActivityOptions {
    if (!this.playing) {
      return BOT_DEFAULT_ACTIVITY;
    }
    return {
      name: `${this.playing.song.title} | ${this.playing.song.author}`,
      type: ActivityType.Playing
    }
  }
}


