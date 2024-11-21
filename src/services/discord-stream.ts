import { Transform, TransformCallback } from 'stream';
import { ChildProcess, spawn, exec } from 'child_process';
import { StreamType, createAudioResource, AudioResource } from '@discordjs/voice';
const pathToFfmpeg = require('ffmpeg-static');

export class DiscordStream {
  private ffmpegPath: string = 'ffmpeg';
  private args: string[] = [];
  private process?: ChildProcess;
  private stream: VolumeTransformer;
  public audioResource: AudioResource;

  constructor(url: string) {
    this.args = [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-analyzeduration', '0',
      '-hide_banner',
      '-i', url,
      '-ar', '48000',
      '-ac', '2',
      '-f', 's16le',
      'pipe:1'
    ];

    exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error || stderr) {
        this.ffmpegPath = pathToFfmpeg;
        return;
      }
    });

    this.stream = new VolumeTransformer();
    this.stream
      .on('close', () => this.kill())
      .on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
        throw err;
      });

    this.audioResource = createAudioResource(this.stream, { inputType: StreamType.Raw, inlineVolume: false });
  }

  spawn() {
    // console.log(this.args.join(' '))
    this.process = spawn(this.ffmpegPath, this.args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    })
      .on('error', (err: any) => {
        throw err;
      })
      .on('exit', (code: any, signal: any) => {
        if (!code || [0, 255].includes(code)) return;
        throw new Error(`ffmpeg exited with code ${code}`);
      });

    if (!this.process.stdout || !this.process.stderr) {
      this.kill();
      throw new Error('Failed to create ffmpeg process');
    }

    this.process.stdout.pipe(this.stream as any);
    this.process.stderr.setEncoding('utf8')?.on('data', (data: string) => {
      const lines = data.split(/\r\n|\r|\n/u);
      for (const line of lines) {
        if (/^\s*$/.test(line)) continue;
      }
    });
  }

  kill() {
    if (!this.stream.destroyed) this.stream.destroy();
    if (this.process && !this.process.killed) this.process.kill('SIGKILL');
  }

  setVolume(volume: number) {
    this.stream.vol = volume;
  }
}

// Based on prism-media
class VolumeTransformer extends Transform {
  private buffer = Buffer.allocUnsafe(0);
  private readonly extrema = [-Math.pow(2, 16 - 1), Math.pow(2, 16 - 1) - 1];
  vol = 1;

  override _transform(newChunk: Buffer, _encoding: BufferEncoding, done: TransformCallback): void {
    const { vol } = this;
    if (vol === 1) {
      this.push(newChunk);
      done();
      return;
    }

    const bytes = 2;
    const chunk = Buffer.concat([this.buffer, newChunk]);
    const readableLength = Math.floor(chunk.length / bytes) * bytes;

    for (let i = 0; i < readableLength; i += bytes) {
      const value = chunk.readInt16LE(i);
      const clampedValue = Math.min(this.extrema[1], Math.max(this.extrema[0], value * vol));
      chunk.writeInt16LE(clampedValue, i);
    }

    this.buffer = chunk.subarray(readableLength);
    this.push(chunk.subarray(0, readableLength));
    done();
  }
}