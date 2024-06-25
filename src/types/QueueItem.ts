import { Song } from '@/types';

export interface QueueItem {
  song: Song;
  requester: string;
}