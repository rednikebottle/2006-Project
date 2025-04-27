export interface Report {
  id: string;
  childId: string;
  childName: string;
  centerId: string;
  centerName: string;
  date: string;
  activities: Array<{
    name: string;
    duration: string;
  }>;
  meals: Array<{
    type: string;
    description: string;
    consumed: string;
  }>;
  napTimes: Array<{
    time: string;
    duration: string;
  }>;
  teacherNotes: string;
  createdAt: Date;
  updatedAt: Date;
} 