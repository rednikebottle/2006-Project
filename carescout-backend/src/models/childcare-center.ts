import { EmergencyContact } from './emergency-contact';
import { Message } from './message';

export interface ChildcareCenter {
  id: string;
  centerName: string;
  centerID: string;
  address: string;
  phoneNumber: string;
  email: string;
  operatingHours: string;
  description: string;
  centerRating: number;
  photoUrl: string;
  availabilityDays: boolean[];
  getEmergencyContact(): EmergencyContact;
  sendMessageToGuardian(message: string): Promise<void>;
} 