// src/controllers/centersController.ts
import { Request, Response } from 'express';
import { db } from '../config/firebase';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role?: string;
  };
}

interface Center {
  id?: string;
  name: string;
  address: string;
  capacity: number;
  // Add other center properties as needed
}

// Get all centers
export const getCenters = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('centers').get();
    const centers: Center[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Center, 'id'>
    }));
    res.status(200).json(centers);
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single center
export const getCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('centers').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Center not found' });
      return;
    }
    
    res.status(200).json({
      id: doc.id,
      ...doc.data() as Omit<Center, 'id'>
    });
  } catch (error) {
    console.error('Error fetching center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new center
export const createCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const centerData: Omit<Center, 'id'> = req.body;
    
    // Validate required fields
    if (!centerData.name || !centerData.address) {
      res.status(400).json({ error: 'Name and address are required' });
      return;
    }

    const docRef = await db.collection('centers').add(centerData);
    res.status(201).json({ 
      id: docRef.id,
      message: 'Center created successfully' 
    });
  } catch (error) {
    console.error('Error creating center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update center
export const updateCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: Partial<Center> = req.body;
    
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No update data provided' });
      return;
    }

    await db.collection('centers').doc(id).update(updateData);
    res.status(200).json({ 
      message: 'Center updated successfully' 
    });
  } catch (error) {
    console.error('Error updating center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete center
export const deleteCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.collection('centers').doc(id).delete();
    res.status(200).json({ 
      message: 'Center deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get children in center
export const getCenterChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('children')
      .where('centerId', '==', id)
      .get();
    
    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Book a center
export const bookCenter = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { childId, startDate, endDate } = req.body;
    
    if (!req.user?.uid) {
      console.log('[bookCenter] No user ID in request');
      res.status(401).json({ error: 'Unauthorized - No user ID' });
      return;
    }
    
    const userId = req.user.uid;

    console.log('[bookCenter] Booking attempt:', {
      centerId: id,
      childId,
      userId,
      startDate,
      endDate
    });

    // Validate required fields
    if (!childId || !startDate || !endDate) {
      console.log('[bookCenter] Missing required fields:', { childId, startDate, endDate });
      res.status(400).json({ error: 'Child ID, start date, and end date are required' });
      return;
    }

    // Check if center exists
    const centerDoc = await db.collection('centers').doc(id).get();
    if (!centerDoc.exists) {
      console.log('[bookCenter] Center not found:', id);
      res.status(404).json({ error: 'Center not found' });
      return;
    }

    // Check if child exists and belongs to user
    try {
      const childDoc = await db.collection('children').doc(childId).get();
      if (!childDoc.exists) {
        console.log('[bookCenter] Child not found:', childId);
        res.status(404).json({ error: 'Selected child not found' });
        return;
      }

      const childData = childDoc.data();
      console.log('[bookCenter] Child data:', {
        childId,
        childData,
        requestUserId: userId
      });

      if (!childData) {
        console.log('[bookCenter] Child data is null:', childId);
        res.status(404).json({ error: 'Selected child not found' });
        return;
      }

      if (childData.parentId !== userId) {
        console.log('[bookCenter] Child authorization failed:', {
          childParentId: childData.parentId,
          requestUserId: userId
        });
        res.status(403).json({ error: 'You are not authorized to book for this child' });
        return;
      }
    } catch (error) {
      console.error('[bookCenter] Error checking child:', error);
      res.status(500).json({ error: 'Error validating child information' });
      return;
    }

    // Create booking
    try {
      const booking = {
        centerId: id,
        childId,
        userId,
        startDate,
        endDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const bookingRef = await db.collection('bookings').add(booking);
      console.log('[bookCenter] Booking created:', bookingRef.id);
      
      // Create a chat for the new booking
      try {
        const centerData = centerDoc.data();
        
        if (centerData) {
          const chatData = {
            bookingId: bookingRef.id,
            teacherName: `${centerData.name} Staff`,
            role: 'Childcare Provider',
            center: centerData.name,
            participants: [userId],
            messages: [],
            lastMessage: 'Booking created. Start your conversation!',
            lastMessageTime: new Date().toISOString()
          };
          
          await db.collection('chats').add(chatData);
          console.log('[bookCenter] Chat created for booking:', bookingRef.id);
        }
      } catch (error) {
        console.error('[bookCenter] Error creating chat:', error);
        // Don't fail the booking if chat creation fails
      }

      res.status(201).json({ 
        id: bookingRef.id,
        message: 'Booking created successfully',
        booking: {
          id: bookingRef.id,
          ...booking
        }
      });
    } catch (error) {
      console.error('[bookCenter] Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  } catch (error) {
    console.error('[bookCenter] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};