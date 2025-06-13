export class CacheSerivce {
  private preflix: string;
  private minutes: number;

  constructor(preflix: string, minutes: number) {
    this.preflix = preflix;
    this.minutes = minutes;
  }

  public key(key: string): string {
    return `${this.preflix}:${key}`;
  }

  public ttl(): number {
    return this.minutes * 60;
  }
}