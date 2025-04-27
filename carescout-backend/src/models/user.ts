export interface User {
    uid: string;
    email: string;
    password: string;
    role: 'guardian' | 'provider' | 'admin';
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
  }
  