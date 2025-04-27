export interface Message {
  id: string;
  messageID: string;
  content: string;
  timestamp: Date;
  senderID: string;
  receiverID: string;
  addMessageToContent(content: string): boolean;
  deleteMessage(): boolean;
} 