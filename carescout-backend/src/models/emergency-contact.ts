export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relation: string;
  getEmergencyDetails(): string;
} 