import { youtubeDl, Flags } from 'youtube-dl-exec';
import { performance } from 'perf_hooks';

export class YoutubeDlService {
  private baseFlags: Flags;

  constructor(flags: Flags) {
    this.baseFlags = flags;
  }

  public async exec(url: string, flags?: Flags): Promise<any> {
    const start = performance.now();
    const mergedFlags = { ...this.baseFlags, ...flags };
    const result = await youtubeDl(url, mergedFlags);
    const end = performance.now();
    console.log(`youtubeDl executed in ${(end - start).toFixed(2)} ms for: ${url}`);
    return result;
  }
}
