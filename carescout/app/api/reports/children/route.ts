import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-config';
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';

async function createDummyReport(childId: string, childName: string, bookingDate: Date) {
  const reportData = {
    childId,
    childName,
    centerName: 'Bright Horizons Childcare',
    date: Timestamp.fromDate(bookingDate),
    activities: [
      {
        name: 'Morning Circle Time',
        completed: true,
        notes: 'Participated enthusiastically in group discussions'
      },
      {
        name: 'Arts and Crafts',
        completed: true,
        notes: 'Created a beautiful finger painting'
      },
      {
        name: 'Outdoor Play',
        completed: true,
        notes: 'Enjoyed playing in the sandbox and on the swings'
      },
      {
        name: 'Story Time',
        completed: true,
        notes: 'Showed great interest in the story and asked questions'
      }
    ],
    meals: [
      {
        name: 'Breakfast',
        completed: true,
        notes: 'Ate all of their breakfast'
      },
      {
        name: 'Morning Snack',
        completed: true,
        notes: 'Had fruit and water'
      },
      {
        name: 'Lunch',
        completed: true,
        notes: 'Enjoyed their lunch'
      }
    ],
    napTimes: [
      {
        start: '13:00',
        end: '14:30',
        duration: '1.5 hours'
      }
    ],
    teacherNotes: `${childName} had a wonderful day! They were very engaged in all activities and played well with their friends.`,
    mood: 'Happy and energetic throughout the day',
    createdAt: Timestamp.now()
  };

  const reportsCollection = collection(db, 'reports');
  const docRef = await addDoc(reportsCollection, reportData);
  return { id: docRef.id, ...reportData };
}

export async function GET(req: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Get the user ID from the client's token
    let userId;
    try {
      const idToken = await auth.currentUser?.getIdTokenResult(true);
      if (!idToken) {
        console.error('No ID token available');
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      userId = idToken.claims.user_id;
      console.log('Authenticated user ID:', userId);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's children
    const childrenCollection = collection(db, 'children');
    const childrenQuery = query(childrenCollection, where('guardianId', '==', userId));
    const childrenSnapshot = await getDocs(childrenQuery);

    if (childrenSnapshot.empty) {
      console.log('No children found for user:', userId); // Debug log
      return NextResponse.json({}, { status: 200 });
    }

    console.log('Found children:', childrenSnapshot.size); // Debug log

    // Get reports for each child
    const reportsByChild: { [key: string]: any[] } = {};
    
    for (const childDoc of childrenSnapshot.docs) {
      const childId = childDoc.id;
      const childData = childDoc.data();

      console.log('Processing child:', childId, childData.name); // Debug log

      // First, get the latest completed booking for this child
      const bookingsCollection = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsCollection,
        where('childId', '==', childId),
        where('status', '==', 'completed'),
        orderBy('startDate', 'desc'),
        limit(1)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      if (!bookingsSnapshot.empty) {
        const latestBooking = bookingsSnapshot.docs[0].data();
        console.log('Found completed booking:', latestBooking); // Debug log
        const bookingDate = latestBooking.startDate.toDate();

        // Get reports for this child on the booking date
        const reportsCollection = collection(db, 'reports');
        const reportsQuery = query(
          reportsCollection,
          where('childId', '==', childId),
          where('date', '==', Timestamp.fromDate(bookingDate)),
          limit(1)
        );
        const reportsSnapshot = await getDocs(reportsQuery);

        if (reportsSnapshot.empty) {
          // No report exists for this booking, create a dummy one
          console.log('Creating dummy report for child:', childId, 'for date:', bookingDate);
          const dummyReport = await createDummyReport(childId, childData.name, bookingDate);
          reportsByChild[childId] = [dummyReport];
        } else {
          // Use existing report
          reportsByChild[childId] = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            childId,
            childName: childData.name,
            ...doc.data()
          }));
        }
      } else {
        console.log('No completed bookings found for child:', childId); // Debug log
      }
    }

    return NextResponse.json(reportsByChild);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
} 