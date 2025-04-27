import express, { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { authenticate } from '../middlewares/authMiddleware';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { broadcastBookingUpdate } from '../websocket';

interface Center {
  id: string;
  name: string;
}

interface Child {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  userId: string;
  centerId: string;
  centerName?: string;
  childId: string;
  childName?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  createdAt?: string;
}

const router = express.Router();

// Public test endpoint
router.get('/test', (req: Request, res: Response) => {
  console.log('[GET /bookings/test] Test endpoint hit');
  res.json({ message: 'Bookings route is working!' });
});

// Get all bookings for the authenticated user
const getBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('[Bookings] GET request received');
    console.log('[Bookings] User ID:', req.user?.uid);

    if (!req.user?.uid) {
      console.log('[Bookings] No user ID found');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // First, auto-complete any past bookings
    console.log('[Bookings] Running auto-complete check...');
    await autoCompleteBookings();
    console.log('[Bookings] Auto-complete check finished');

    try {
      // Get all bookings for the user
      console.log('[Bookings] Fetching bookings for user:', req.user.uid);
      const querySnapshot = await db.collection('bookings')
        .where('userId', '==', req.user.uid)
        .get();

      console.log('[Bookings] Found bookings:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('[Bookings] No bookings found for user');
        res.json({
          current: [],
          past: [],
          cancelled: []
        });
        return;
      }

      // Log raw booking data
      console.log('[Bookings] Raw booking data:', querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      // Get all bookings with details
      const allBookings = await Promise.all(querySnapshot.docs.map(async doc => {
        const bookingData = doc.data() as Omit<Booking, 'id' | 'centerName' | 'childName'>;
        console.log('[Bookings] Processing booking:', { id: doc.id, ...bookingData });
        
        // Fetch center details
        const centerDoc = await db.collection('centers').doc(bookingData.centerId).get();
        const centerData = centerDoc.data() as Center | undefined;
        console.log('[Bookings] Center data for booking:', centerData);
        
        // Fetch child details
        const childDoc = await db.collection('children').doc(bookingData.childId).get();
        const childData = childDoc.data() as Child | undefined;
        console.log('[Bookings] Child data for booking:', childData);
        
        return {
          id: doc.id,
          ...bookingData,
          centerName: centerData?.name || 'Unknown Center',
          childName: childData?.name || 'Unknown Child'
        } as Booking;
      }));

      console.log('[Bookings] All bookings with details:', allBookings);

      // Separate bookings into current, past, and cancelled
      const now = new Date();
      console.log('[Bookings] Current time for comparison:', now.toISOString());

      const { current, past, cancelled } = allBookings.reduce((acc, booking) => {
        const endDate = new Date(booking.endDate);
        const startDate = new Date(booking.startDate);

        console.log('[Bookings] Categorizing booking:', {
          id: booking.id,
          status: booking.status,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isPast: endDate < now,
          isFuture: startDate >= now
        });

        // First check cancelled status
        if (booking.status === 'cancelled') {
          acc.cancelled.push(booking);
        }
        // Then check completed status
        else if (booking.status === 'completed') {
          acc.past.push(booking);
        }
        // Finally check dates for non-cancelled, non-completed bookings
        else if (endDate < now) {
          acc.past.push({ ...booking, status: 'completed' });
        }
        else if (startDate >= now) {
          acc.current.push(booking);
        }
        return acc;
      }, { 
        current: [] as Booking[], 
        past: [] as Booking[],
        cancelled: [] as Booking[]
      });

      // Sort all arrays by date (most recent first)
      const sortByDate = (a: Booking, b: Booking) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      };

      current.sort(sortByDate);
      past.sort(sortByDate);
      cancelled.sort(sortByDate);

      console.log('[Bookings] Final categorized bookings:', {
        current: current.map(b => ({ id: b.id, status: b.status, startDate: b.startDate })),
        past: past.map(b => ({ id: b.id, status: b.status, startDate: b.startDate })),
        cancelled: cancelled.map(b => ({ id: b.id, status: b.status, startDate: b.startDate }))
      });

      res.json({
        current,
        past,
        cancelled
      });
      
    } catch (error: any) {
      console.error('[Bookings] Error:', error);
      throw error;
    }
  } catch (error: any) {
    next(error);
  }
};

// Function to check and auto-complete past bookings
const autoCompleteBookings = async () => {
  const now = new Date();
  const bookingsRef = db.collection('bookings');
  
  // Get all non-completed, non-cancelled bookings
  const bookingsSnapshot = await bookingsRef
    .where('status', 'in', ['pending', 'confirmed', 'rescheduled'])
    .get();

  const batch = db.batch();
  
  bookingsSnapshot.docs.forEach(doc => {
    const booking = doc.data() as Booking;
    const endDate = new Date(booking.endDate);
    
    // If the booking end date has passed, mark it as completed
    if (endDate < now) {
      batch.update(doc.ref, { status: 'completed' });
    }
  });

  await batch.commit();
};

const createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.body;
    const now = new Date();
    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);

    // Validate booking dates
    if (bookingStart < now || bookingEnd < now) {
      res.status(400).json({ error: 'Cannot book for past dates' });
      return;
    }

    if (bookingEnd <= bookingStart) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Fetch center and child details first
    const centerDoc = await db.collection('centers').doc(req.body.centerId).get();
    const childDoc = await db.collection('children').doc(req.body.childId).get();

    const centerData = centerDoc.data() as Center | undefined;
    const childData = childDoc.data() as Child | undefined;

    const bookingData = {
      userId: req.user.uid,
      centerId: req.body.centerId,
      centerName: centerData?.name || 'Unknown Center',
      childId: req.body.childId,
      childName: childData?.name || 'Unknown Child',
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const bookingRef = await db.collection('bookings').add(bookingData);
    const newBooking = { ...bookingData, id: bookingRef.id };

    // Auto-complete any past bookings
    await autoCompleteBookings();

    // Send real-time update
    broadcastBookingUpdate(req.user.uid);

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookingId = req.params.id;
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data() as Booking;
    if (booking.userId !== req.user.uid) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    // Start a batch write
    const batch = db.batch();

    // Update booking status
    batch.update(bookingRef, { status: 'cancelled' });

    // Find and delete associated chat
    const chatsSnapshot = await db.collection('chats')
      .where('bookingId', '==', bookingId)
      .get();

    chatsSnapshot.docs.forEach(chatDoc => {
      batch.delete(chatDoc.ref);
    });

    // Commit all changes
    await batch.commit();

    // Send real-time update
    broadcastBookingUpdate(req.user.uid);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    next(error);
  }
};

const rescheduleBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    const now = new Date();
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    // Validate booking dates
    if (newStartDate < now || newEndDate < now) {
      res.status(400).json({ error: 'Cannot reschedule to past dates' });
      return;
    }

    if (newEndDate <= newStartDate) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const bookingData = bookingDoc.data() as Booking;
    if (bookingData.userId !== req.user.uid) {
      res.status(403).json({ error: 'Unauthorized - Not your booking' });
      return;
    }

    await bookingRef.update({
      startDate,
      endDate,
      status: 'confirmed'
    });

    // Re-fetch center and child names to ensure they're current
    const centerDoc = await db.collection('centers').doc(bookingData.centerId).get();
    const childDoc = await db.collection('children').doc(bookingData.childId).get();

    const centerData = centerDoc.data() as Center | undefined;
    const childData = childDoc.data() as Child | undefined;

    const updatedBooking = {
      ...bookingData,
      id,
      startDate,
      endDate,
      status: 'confirmed',
      centerName: centerData?.name || 'Unknown Center',
      childName: childData?.name || 'Unknown Child'
    };

    // Auto-complete any past bookings
    await autoCompleteBookings();

    // Send real-time update
    broadcastBookingUpdate(req.user.uid);

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookingId = req.params.id;
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data() as Booking;
    if (booking.userId !== req.user.uid) {
      res.status(403).json({ error: 'Not authorized to complete this booking' });
      return;
    }

    await bookingRef.update({ status: 'completed' });

    // Send real-time update
    broadcastBookingUpdate(req.user.uid);

    res.json({ message: 'Booking completed successfully' });
  } catch (error) {
    next(error);
  }
};

// Check if user has completed bookings for a center
const checkBookingStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { centerId } = req.params;
    console.log('[Bookings] Checking completed bookings for center:', centerId);

    const querySnapshot = await db.collection('bookings')
      .where('userId', '==', req.user.uid)
      .where('centerId', '==', centerId)
      .where('status', '==', 'completed')
      .get();

    const hasCompletedBooking = !querySnapshot.empty;
    console.log('[Bookings] Has completed booking:', hasCompletedBooking);

    res.json({ hasCompletedBooking });
  } catch (error) {
    next(error);
  }
};

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.patch('/:id/reschedule', authenticate, rescheduleBooking);
router.patch('/:id/complete', authenticate, completeBooking);
router.get('/check-status/:centerId', authenticate, checkBookingStatus);

export default router;
