import { ChildcareCenter } from './childcare-center';
import { Message } from './message';

export interface ChildcareAdmin {
  id: string;
  name: string;
  adminID: string;
  email: string;
  center: ChildcareCenter;
  updateCenterInformation(center: ChildcareCenter, name: string, email: string, bool: boolean): Promise<void>;
  sendMessageToGuardian(message: string): Promise<void>;
  viewChatHistory(): Promise<Message[]>;
} 