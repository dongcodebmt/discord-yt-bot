export const formatSeconds = (seconds: number): string => {
  var date = new Date(1970, 0, 1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
};

export const shuffle = (unshuffled: any[]): any[] => {
  return unshuffled
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
};

export const timeStringToSeconds = (time: string): number => {
  const parts = time.split(':').map(Number);

  if (parts.length === 2) {
    // Format: mm:ss
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    // Format: hh:mm:ss
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  throw new Error('Invalid time format');
}