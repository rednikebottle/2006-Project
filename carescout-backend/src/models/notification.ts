export interface Notification {
  id: string;
  notifyID: string;
  type: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  createNotification(type: string, message: string): Promise<void>;
  updateNotificationStatus(id: string): Promise<void>;
  getNotification(): Promise<Notification>;
} 