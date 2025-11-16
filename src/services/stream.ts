import { PassThrough } from 'stream';
import { createAudioResource, AudioResource, StreamType } from '@discordjs/voice';
import prism from 'prism-media';

export class StreamService {
  public audioResource: AudioResource<null>;
  private ffmpeg: prism.FFmpeg;
  private args: string[] = [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-analyzeduration', '0',
    '-ar', '48000',
    '-ac', '2',
    '-c:a', 'libopus',
    '-f', 'webm'
  ];
  // Increase the buffer size to fix sudden stops in playback
  // I don't have any idea to fix this issue
  private bufferSize = 2 << 25; // ~64MB

  constructor(url: string) {
    const args = ['-i', url, ...this.args];
    this.ffmpeg = new prism.FFmpeg({ args });
    const stream = this.ffmpeg.pipe(new PassThrough({ highWaterMark: this.bufferSize }));
    this.audioResource = createAudioResource(stream, { inputType: StreamType.WebmOpus });
  }

  kill() {
    this.ffmpeg.destroy();
  }
}