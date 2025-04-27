import { Request, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const usersSnapshot = await db.collection('users').get();
    const users: User[] = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt?.toDate()
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update user role in Firestore
    await db.collection('users').doc(id).update({ role });

    // Update custom claims in Firebase Auth
    await admin.auth().setCustomUserClaims(id, { role });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get total users count
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Get total centers count
    const centersSnapshot = await db.collection('centers').count().get();
    const totalCenters = centersSnapshot.data().count;

    // Get total children count
    const childrenSnapshot = await db.collection('children').count().get();
    const totalChildren = childrenSnapshot.data().count;

    res.json({
      totalUsers,
      totalCenters,
      totalChildren
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get recent registrations
    const recentUsers = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    // Get center occupancy rates
    const centersSnapshot = await db.collection('centers').get();
    const occupancyRates = [];

    for (const centerDoc of centersSnapshot.docs) {
      const center = centerDoc.data();
      const childrenCount = await db.collection('children')
        .where('centerId', '==', centerDoc.id)
        .count()
        .get();

      occupancyRates.push({
        centerId: centerDoc.id,
        name: center.name,
        capacity: center.capacity,
        currentChildren: childrenCount.data().count,
        occupancyRate: (childrenCount.data().count / center.capacity) * 100
      });
    }

    res.json({
      recentRegistrations: recentUsers.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      occupancyRates
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
}; 