import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  userId: string;
  createdAt: Timestamp;
}

export const addEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, phoneNumber, relationship } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !relationship) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if maximum contacts limit reached (e.g., 5 contacts)
    const existingContacts = await db.collection('emergency-contacts')
      .where('userId', '==', userId)
      .get();

    if (existingContacts.size >= 5) {
      return res.status(400).json({ 
        error: 'Maximum number of emergency contacts reached. Please delete an existing contact first.' 
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const contactRef = db.collection('emergency-contacts').doc();
    const timestamp = Timestamp.now();
    const contact: EmergencyContact = {
      id: contactRef.id,
      name,
      phoneNumber,
      relationship,
      userId,
      createdAt: timestamp
    };

    await contactRef.set(contact);
    
    // Convert Timestamp to a format that can be serialized
    const responseContact = {
      ...contact,
      createdAt: {
        seconds: timestamp.seconds,
        nanoseconds: timestamp.nanoseconds
      }
    };
    
    res.status(201).json(responseContact);
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({ error: 'Failed to add emergency contact' });
  }
};

export const getEmergencyContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Fetching emergency contacts for user:', userId);

    // Try the simple query first while index builds
    const fallbackSnapshot = await db.collection('emergency-contacts')
      .where('userId', '==', userId)
      .get();

    const contacts = fallbackSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: {
          seconds: data.createdAt?.seconds || 0,
          nanoseconds: data.createdAt?.nanoseconds || 0
        }
      };
    });

    // Sort in memory
    contacts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    
    console.log(`Successfully fetched ${contacts.length} contacts`);
    return res.json(contacts);

  } catch (error: any) {
    console.error('Error fetching emergency contacts:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details
    });
    res.status(500).json({ 
      error: 'Failed to fetch emergency contacts',
      details: error.message 
    });
  }
};

export const updateEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contactId = req.params.contactId;
    console.log('Updating contact:', { contactId, userId, body: req.body });

    const { name, phoneNumber, relationship } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !relationship) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const contactRef = db.collection('emergency-contacts').doc(contactId);
    const contact = await contactRef.get();

    if (!contact.exists) {
      console.log('Contact not found:', contactId);
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contactData = contact.data();
    if (contactData?.userId !== userId) {
      console.log('Unauthorized update attempt:', { contactUserId: contactData?.userId, requestUserId: userId });
      return res.status(403).json({ error: 'Not authorized to update this contact' });
    }

    const updatedData = {
      name,
      phoneNumber,
      relationship,
      updatedAt: Timestamp.now()
    };

    await contactRef.update(updatedData);

    // Return the full contact data with proper timestamp format
    const responseContact = {
      id: contactId,
      ...updatedData,
      userId,
      createdAt: {
        seconds: contactData.createdAt.seconds,
        nanoseconds: contactData.createdAt.nanoseconds
      }
    };

    console.log('Successfully updated contact:', responseContact);
    res.json(responseContact);
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({ error: 'Failed to update emergency contact' });
  }
};

export const deleteEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contactId = req.params.contactId;
    console.log('Deleting contact:', { contactId, userId });

    const contactRef = db.collection('emergency-contacts').doc(contactId);
    const contact = await contactRef.get();

    if (!contact.exists) {
      console.log('Contact not found:', contactId);
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contactData = contact.data();
    if (contactData?.userId !== userId) {
      console.log('Unauthorized delete attempt:', { contactUserId: contactData?.userId, requestUserId: userId });
      return res.status(403).json({ error: 'Not authorized to delete this contact' });
    }

    await contactRef.delete();
    console.log('Successfully deleted contact:', contactId);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ error: 'Failed to delete emergency contact' });
  }
}; 