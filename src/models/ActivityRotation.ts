import { Client, ActivityType, ChannelType } from 'discord.js';
import { servers } from '@/servers';
import messages from '@/constants/messages';

function getPlayingServerCount(): number {
  return servers?.size ?? 0;
}

async function getTotalListeners(client: Client): Promise<number> {
  let total = 0;
  for (const srv of servers?.values()) {
    const guild = await client.guilds.fetch(srv.guildId);
    if (!guild) {
      continue;
    }
    
    const channelId = srv.voiceConnection.joinConfig.channelId;
    const voiceChannel = guild.channels.cache.get(channelId as string);

    if (voiceChannel && voiceChannel.type === ChannelType.GuildVoice) {
        total += voiceChannel.members.size;
    }
  }
  return total;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return messages.activityMorning;
  if (hour >= 12 && hour < 18) return messages.activityAfternoon;
  return messages.activityEvening;
}

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if ([3, 4, 5].includes(month)) return messages.activitySpring;
  if ([6, 7, 8].includes(month)) return messages.activitySummer;
  if ([9, 10, 11].includes(month)) return messages.activityAutumn;
  return messages.activityWinter;
}

function getSpecialEvent(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 2 && day === 14) return messages.activityValentine;
  if (month === 10 && day === 31) return messages.activityHalloween;
  if (month === 12 && day >= 20 && day <= 31) return messages.activityChristmas;
  if (month === 1 && day <= 7) return messages.activityNewYear;
  return null;
}

export async function startActivityRotation(client: Client) {
  const interval = 30_000;

  const activities = async () => {
    const serverCount = getPlayingServerCount();
    const listenerCount = await getTotalListeners(client);
    const specialEvent = getSpecialEvent();
    const timeOfDay = getTimeOfDay();
    const season = getSeason();

    const baseActivities = [
      {
        name: messages.activityHelp,
        type: ActivityType.Custom,
        
      },
      {
        name: messages.activityServerCount(serverCount),
        type: ActivityType.Playing,
      },
      {
        name: messages.activityTotalListeners(listenerCount),
        type: ActivityType.Listening,
      },
      {
        name: timeOfDay,
        type: ActivityType.Listening
      },
      {
        name: season,
        type: ActivityType.Listening
      }
    ];

    if (specialEvent) {
      baseActivities.unshift({ name: specialEvent, type: ActivityType.Custom });
    }
    return baseActivities;
  };

  setInterval(async () => {
    const list = await activities();
    const randomIndex = Math.floor(Math.random() * list.length);
    client.user?.setActivity(list[randomIndex]);
  }, interval);
}
