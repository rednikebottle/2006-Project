import { Message } from './message';

export interface Chat {
  id: string;
  chatID: string;
  senderID: string;
  receiverID: string;
  timestamp: Date;
  sendMessageToGuardian(message: string, content: string): boolean;
  viewChatHistory(): Message[];
  deleteMessage(messageId: string): boolean;
} 