import { Message } from 'discord.js';
import { BAD_WORDS } from '@/constants/config';
import messages from '@/constants/messages';

function messageCheck (message: string, words: string[]): Boolean {
  return words.some(word => message.includes(word));
};

export const messageFilter = async (message: Message): Promise<void> => {
  if (BAD_WORDS.length <= 0) {
    return;
  }
  const content = message.content.toLowerCase();
  const check = messageCheck(content, BAD_WORDS);
  if (check) {
    message.reply(messages.badWordMessage);
    setTimeout(() => {
      message.delete();
    }, 1000);
  }
};
