import { firestore } from 'firebase-admin';
import { db } from '../config/firebase';  // Ensure the correct import for db

export const searchCentres = async (filters: {
  location?: string;
  maxFee?: number;
  levels?: string[];
}) => {
  let query: any = db.collection('childcare_centres');
  
  if (filters.location) query = query.where('location', '==', filters.location);
  if (filters.maxFee) query = query.where('fees', '<=', filters.maxFee);
  
  const snapshot = await query.get();
  
  // Type the doc parameter as QueryDocumentSnapshot
  return snapshot.docs.map((doc: firestore.QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data()
  }));
};
