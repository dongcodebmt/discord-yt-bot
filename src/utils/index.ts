const commandExists = require('command-exists-promise');

export const formatSeconds = (seconds: number): string => {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
};

export const shuffle = (unshuffled: any[]): any[] => {
  return unshuffled
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
};

export const ffmpegExists = async (): Promise<Boolean> => {
  try {
    const exists = await commandExists('ffmpeg')
    return exists === true;
  } catch (err) {
    return false;
  }
};