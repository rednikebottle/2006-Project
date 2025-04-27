import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

interface UserSettings {
  id: string;
  email: string;
  name: string;
  phone: string;
  notifications: {
    // Notification methods
    email: boolean;
    sms: boolean;
    enabled: boolean;
    
    // Booking related
    bookingReminders: boolean;
    newSlots: boolean;
    pickupTimes: boolean;
    
    // Updates and reports
    emergencyClosures: boolean;
    dailyReports: boolean;
    promotions: boolean;
    
    // Reviews and marketing
    reviewReminders: boolean;
    marketingEmails: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

export async function getUserSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data() as Partial<UserSettings>;
    const settings: UserSettings = {
      id: userId,
      email: userData.email || '',
      name: userData.name || '',
      phone: userData.phone || '',
      notifications: {
        // Notification methods
        email: userData.notifications?.email ?? true,
        sms: userData.notifications?.sms ?? true,
        enabled: userData.notifications?.enabled ?? true,
        
        // Booking related
        bookingReminders: userData.notifications?.bookingReminders ?? true,
        newSlots: userData.notifications?.newSlots ?? true,
        pickupTimes: userData.notifications?.pickupTimes ?? true,
        
        // Updates and reports
        emergencyClosures: userData.notifications?.emergencyClosures ?? true,
        dailyReports: userData.notifications?.dailyReports ?? false,
        promotions: userData.notifications?.promotions ?? false,
        
        // Reviews and marketing
        reviewReminders: userData.notifications?.reviewReminders ?? true,
        marketingEmails: userData.notifications?.marketingEmails ?? false
      },
      preferences: {
        theme: userData.preferences?.theme || 'system',
        language: userData.preferences?.language || 'en',
      },
    };

    res.json(settings);
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ error: 'Failed to get user settings' });
  }
}

export const updateUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updates = req.body;
    const validFields = ['name', 'phone', 'notifications', 'preferences'];
    
    // Validate the request body
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    // Check if any of the provided fields are valid
    const hasValidField = Object.keys(updates).some(key => validFields.includes(key));
    if (!hasValidField) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (validFields.includes(key)) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {} as Partial<UserSettings>);

    // Validate notifications structure if it's being updated
    if (filteredUpdates.notifications) {
      const requiredFields = [
        'email', 'sms', 'enabled',
        'bookingReminders', 'newSlots', 'pickupTimes',
        'emergencyClosures', 'dailyReports', 'promotions',
        'reviewReminders', 'marketingEmails'
      ];
      
      const missingFields = requiredFields.filter(
        field => typeof filteredUpdates.notifications?.[field as keyof UserSettings['notifications']] !== 'boolean'
      );

      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: 'Invalid notifications structure',
          details: `Missing or invalid fields: ${missingFields.join(', ')}`
        });
        return;
      }
    }

    try {
      // Update the document
      await db.collection('users').doc(userId).update(filteredUpdates);
      
      // Get the updated document
      const updatedDoc = await db.collection('users').doc(userId).get();
      const updatedData = updatedDoc.data();
      
      if (!updatedData) {
        res.status(500).json({ error: 'Failed to retrieve updated settings' });
        return;
      }

      // Send the response
      res.json({
        id: userId,
        ...updatedData,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ 
        error: 'Failed to update settings in database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await auth.getUser(userId);
    if (!user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Firebase doesn't provide a direct way to verify the current password
    // You might want to implement additional security measures here

    await auth.updateUser(userId, {
      password: newPassword,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete user's children documents
    const childrenSnapshot = await db.collection('children').where('userId', '==', userId).get();
    const childrenDeletions = childrenSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(childrenDeletions);

    // Delete user document
    await db.collection('users').doc(userId).delete();

    // Delete Firebase Auth user
    await auth.deleteUser(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
} 