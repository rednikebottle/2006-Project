import { Child } from './child';
import { EmergencyContact } from './emergency-contact';
import { Message } from './message';
import { Notification } from './notification';
import { Review } from './review';
import { Booking } from './booking';

export interface Guardian {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  children: Child[];
  bookings: Booking[];
  notifications: Notification[];
  emergencyContacts: EmergencyContact[];
  reviews: Review[];
  messages: Message[];
  viewChildcareCenter(): Promise<void>;
  searchChildcareCenters(): Promise<void>;
  viewChildrenCenter(): Promise<void>;
  sendMessageToCenter(message: string): Promise<void>;
  viewChatHistory(): Promise<Message[]>;
  createNotification(type: string, message: string): Promise<void>;
  viewNotification(): Promise<Notification[]>;
} 