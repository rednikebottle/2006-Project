import { Request, Response } from 'express';
import { db } from '../config/firebase';

// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role?: string;
  };
}

interface Child {
  id?: string;
  name: string;
  age: number;
  gender: string;
  parentId: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log('[getChildren] Authentication error: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[getChildren] Starting retrieval for user:', userId);
    console.log('[getChildren] User role:', req.user?.role);

    const childrenSnapshot = await db.collection('children')
      .where('parentId', '==', userId)
      .get();

    const children: Child[] = [];
    childrenSnapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() } as Child);
    });

    console.log('[getChildren] Total children found:', children.length);
    console.log('[getChildren] Children IDs:', children.map(child => child.id));
    console.log('[getChildren] Request completed successfully for user:', userId);

    res.json(children);
  } catch (error) {
    console.error('[getChildren] Error getting children:', error);
    console.error('[getChildren] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to get children' });
  }
};

export const getChild = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      console.log('[getChild] Authentication error: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[getChild] Starting retrieval for child ID:', id);
    console.log('[getChild] User ID:', userId);
    console.log('[getChild] User role:', req.user?.role);

    const childDoc = await db.collection('children').doc(id).get();
    if (!childDoc.exists) {
      console.log('[getChild] Child not found with ID:', id);
      return res.status(404).json({ error: 'Child not found' });
    }

    const child = childDoc.data() as Child;
    if (child.parentId !== userId) {
      console.log('[getChild] Unauthorized access attempt - Parent ID mismatch');
      console.log('[getChild] Request user ID:', userId);
      console.log('[getChild] Child parent ID:', child.parentId);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[getChild] Successfully retrieved child data');
    console.log('[getChild] Child ID:', childDoc.id);
    res.json({ id: childDoc.id, ...child });
  } catch (error) {
    console.error('[getChild] Error getting child:', error);
    console.error('[getChild] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to get child' });
  }
};

export const createChild = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log('[createChild] Authentication error: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[createChild] Starting child creation for user:', userId);
    console.log('[createChild] User role:', req.user?.role);
    console.log('[createChild] Request body:', JSON.stringify(req.body, null, 2));

    // Enhanced validation
    const { name, age, gender, allergies, medicalConditions, emergencyContact } = req.body;

    // Validate required fields
    const validationErrors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push('Name must be at least 2 characters long');
    }
    
    if (!age || typeof age !== 'number' || age < 0 || age > 18) {
      validationErrors.push('Age must be a number between 0 and 18');
    }
    
    if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      validationErrors.push('Gender must be either male, female, or other');
    }

    // Validate optional fields if provided
    if (allergies && (!Array.isArray(allergies) || allergies.some(a => typeof a !== 'string'))) {
      validationErrors.push('Allergies must be an array of strings');
    }

    if (medicalConditions && (!Array.isArray(medicalConditions) || medicalConditions.some(m => typeof m !== 'string'))) {
      validationErrors.push('Medical conditions must be an array of strings');
    }

    if (emergencyContact) {
      if (typeof emergencyContact !== 'object') {
        validationErrors.push('Emergency contact must be an object');
      } else {
        if (!emergencyContact.name || typeof emergencyContact.name !== 'string') {
          validationErrors.push('Emergency contact name is required and must be a string');
        }
        if (!emergencyContact.phone || !/^\+?[\d\s-]{10,}$/.test(emergencyContact.phone)) {
          validationErrors.push('Emergency contact must have a valid phone number');
        }
        if (!emergencyContact.relationship || typeof emergencyContact.relationship !== 'string') {
          validationErrors.push('Emergency contact relationship is required and must be a string');
        }
      }
    }

    if (validationErrors.length > 0) {
      console.log('[createChild] Validation errors:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const childData: Child = {
      name: name.trim(),
      age,
      gender: gender.toLowerCase(),
      parentId: userId,
      ...(allergies && { allergies }),
      ...(medicalConditions && { medicalConditions }),
      ...(emergencyContact && { emergencyContact })
    };

    console.log('[createChild] Prepared child data:', JSON.stringify(childData, null, 2));

    const docRef = await db.collection('children').add(childData);
    console.log('[createChild] Child created successfully');
    console.log('[createChild] New child ID:', docRef.id);
    console.log('[createChild] Request completed successfully for user:', userId);
    
    res.status(201).json({ id: docRef.id, ...childData });
  } catch (error) {
    console.error('[createChild] Error creating child:', error);
    console.error('[createChild] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to create child' });
  }
};

export const updateChild = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      console.log('[updateChild] Authentication error: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[updateChild] Starting update for child ID:', id);
    console.log('[updateChild] User ID:', userId);
    console.log('[updateChild] User role:', req.user?.role);
    console.log('[updateChild] Update data:', JSON.stringify(req.body, null, 2));

    const childDoc = await db.collection('children').doc(id).get();
    if (!childDoc.exists) {
      console.log('[updateChild] Child not found with ID:', id);
      return res.status(404).json({ error: 'Child not found' });
    }

    const child = childDoc.data() as Child;
    if (child.parentId !== userId) {
      console.log('[updateChild] Unauthorized access attempt - Parent ID mismatch');
      console.log('[updateChild] Request user ID:', userId);
      console.log('[updateChild] Child parent ID:', child.parentId);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate update fields
    const validationErrors = [];
    const { name, age, gender, allergies, medicalConditions, emergencyContact } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        validationErrors.push('Name must be at least 2 characters long');
      }
    }

    if (age !== undefined) {
      if (typeof age !== 'number' || age < 0 || age > 18) {
        validationErrors.push('Age must be a number between 0 and 18');
      }
    }

    if (gender !== undefined) {
      if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
        validationErrors.push('Gender must be either male, female, or other');
      }
    }

    if (allergies !== undefined && (!Array.isArray(allergies) || allergies.some(a => typeof a !== 'string'))) {
      validationErrors.push('Allergies must be an array of strings');
    }

    if (medicalConditions !== undefined && (!Array.isArray(medicalConditions) || medicalConditions.some(m => typeof m !== 'string'))) {
      validationErrors.push('Medical conditions must be an array of strings');
    }

    if (emergencyContact !== undefined) {
      if (typeof emergencyContact !== 'object') {
        validationErrors.push('Emergency contact must be an object');
      } else {
        if (emergencyContact.name !== undefined && typeof emergencyContact.name !== 'string') {
          validationErrors.push('Emergency contact name must be a string');
        }
        if (emergencyContact.phone !== undefined && !/^\+?[\d\s-]{10,}$/.test(emergencyContact.phone)) {
          validationErrors.push('Emergency contact must have a valid phone number');
        }
        if (emergencyContact.relationship !== undefined && typeof emergencyContact.relationship !== 'string') {
          validationErrors.push('Emergency contact relationship must be a string');
        }
      }
    }

    if (validationErrors.length > 0) {
      console.log('[updateChild] Validation errors:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Clean and prepare update data
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(age !== undefined && { age }),
      ...(gender && { gender: gender.toLowerCase() }),
      ...(allergies !== undefined && { allergies }),
      ...(medicalConditions !== undefined && { medicalConditions }),
      ...(emergencyContact !== undefined && { emergencyContact })
    };

    await db.collection('children').doc(id).update(updateData);
    console.log('[updateChild] Successfully updated child data');
    console.log('[updateChild] Updated fields:', Object.keys(updateData));
    res.json({ id, ...updateData });
  } catch (error) {
    console.error('[updateChild] Error updating child:', error);
    console.error('[updateChild] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to update child' });
  }
};

export const deleteChild = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      console.log('[deleteChild] Authentication error: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[deleteChild] Starting deletion for child ID:', id);
    console.log('[deleteChild] User ID:', userId);
    console.log('[deleteChild] User role:', req.user?.role);

    const childDoc = await db.collection('children').doc(id).get();
    if (!childDoc.exists) {
      console.log('[deleteChild] Child not found with ID:', id);
      return res.status(404).json({ error: 'Child not found' });
    }

    const child = childDoc.data() as Child;
    if (child.parentId !== userId) {
      console.log('[deleteChild] Unauthorized access attempt - Parent ID mismatch');
      console.log('[deleteChild] Request user ID:', userId);
      console.log('[deleteChild] Child parent ID:', child.parentId);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('children').doc(id).delete();
    console.log('[deleteChild] Successfully deleted child');
    console.log('[deleteChild] Deleted child ID:', id);
    res.status(204).send();
  } catch (error) {
    console.error('[deleteChild] Error deleting child:', error);
    console.error('[deleteChild] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to delete child' });
  }
}; 