import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Report } from '../models/report';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

interface Booking {
  id: string;
  userId: string;
  childId: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Function to generate dummy report data for a completed booking
const generateDummyReport = (childId: string, bookingDate: string): Report => {
  const activities = [
    'Morning Circle Time',
    'Arts and Crafts',
    'Outdoor Play',
    'Story Time',
    'Music and Movement'
  ];

  const meals = [
    'Breakfast: Oatmeal with fruits',
    'Morning Snack: Apple slices',
    'Lunch: Chicken with vegetables',
    'Afternoon Snack: Yogurt with granola'
  ];

  const napTimes = [
    { start: '13:00', end: '14:30', duration: '1.5 hours' }
  ];

  return {
    id: `report-${childId}-${bookingDate}`,
    childId,
    date: bookingDate,
    activities: activities.map(activity => ({
      name: activity,
      completed: true,
      notes: `Successfully participated in ${activity}`
    })),
    meals: meals.map(meal => ({
      name: meal,
      completed: true,
      notes: 'Ate well'
    })),
    napTimes,
    teacherNotes: 'Had a great day! Participated enthusiastically in all activities.',
    mood: 'Happy',
    createdAt: new Date().toISOString()
  } as Report;
};

// Get reports for a child
export const getChildReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { childId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify that the child belongs to the user
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();
    if (childData?.parentId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get reports for the child
    const reportsSnapshot = await db.collection('reports')
      .where('childId', '==', childId)
      .orderBy('date', 'desc')
      .get();

    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];

    res.json(reports);
  } catch (error) {
    console.error('Error getting child reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

// Get reports for all children of a user
export const getUserChildrenReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Getting reports for user:', userId);

    // Get the last completed booking for the user
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('status', '==', 'confirmed')
      .orderBy('endDate', 'desc')
      .limit(1)
      .get();

    console.log('Found bookings:', bookingsSnapshot.size);

    const reportsByChild: { [key: string]: Report[] } = {};

    // Process the last booking if found
    if (!bookingsSnapshot.empty) {
      const lastBooking = {
        id: bookingsSnapshot.docs[0].id,
        ...bookingsSnapshot.docs[0].data()
      } as Booking;

      console.log('Last booking:', {
        id: lastBooking.id,
        childId: lastBooking.childId,
        startDate: lastBooking.startDate,
        endDate: lastBooking.endDate
      });

      const childId = lastBooking.childId;
      const bookingDate = lastBooking.endDate.split('T')[0];

      // Check if a report already exists
      const existingReportSnapshot = await db.collection('reports')
        .where('childId', '==', childId)
        .where('date', '==', bookingDate)
        .get();

      let report: Report;
      
      if (existingReportSnapshot.empty) {
        console.log('No existing report found, generating new report');
        // Generate and save dummy report
        report = generateDummyReport(childId, bookingDate);
        await db.collection('reports').doc(report.id).set(report);
        console.log('Generated and saved new report:', report.id);
      } else {
        console.log('Found existing report');
        report = {
          id: existingReportSnapshot.docs[0].id,
          ...existingReportSnapshot.docs[0].data()
        } as Report;
      }

      reportsByChild[childId] = [report];
    }

    // Get child details for all children
    const childrenSnapshot = await db.collection('children')
      .where('parentId', '==', userId)
      .get();

    console.log('Found children:', childrenSnapshot.size);

    const childDetails = new Map();
    childrenSnapshot.docs.forEach(doc => {
      const data = doc.data();
      childDetails.set(doc.id, data);
      console.log('Child details:', { id: doc.id, name: data.name });
    });

    // Add child names to reports
    Object.keys(reportsByChild).forEach(childId => {
      reportsByChild[childId].forEach(report => {
        report.childName = childDetails.get(childId)?.name || 'Unknown Child';
      });
    });

    console.log('Returning reports for children:', Object.keys(reportsByChild));
    res.json(reportsByChild);

  } catch (error) {
    console.error('Error getting user children reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
}; 