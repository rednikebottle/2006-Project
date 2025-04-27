export interface Report {
  id: string;
  childId: string;
  childName?: string;
  date: string;
  activities: {
    name: string;
    completed: boolean;
    notes: string;
  }[];
  meals: {
    name: string;
    completed: boolean;
    notes: string;
  }[];
  napTimes: {
    start: string;
    end: string;
    duration: string;
  }[];
  teacherNotes: string;
  mood: string;
  createdAt: string;
  updatedAt?: string;
} 