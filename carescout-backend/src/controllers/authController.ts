// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase';

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to send verification email
async function sendVerificationEmail(email: string) {
  const actionCodeSettings = {
    url: process.env.FRONTEND_URL || 'http://localhost:3000/auth/login',
    handleCodeInApp: true
  };

  try {
    // Generate the verification link
    const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
    
    // Get the user
    const user = await admin.auth().getUserByEmail(email);
    
    // Send the verification email using Firebase Admin SDK
    await admin.auth().updateUser(user.uid, {
      emailVerified: false
    });

    // Return the link for testing purposes
    return link;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name, phoneNumber } = req.body;
    
    // Input validation
    if (!email || !password || !name || !phoneNumber) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if email or phone is already in use
    try {
      const existingUserByEmail = await admin.auth().getUserByEmail(email);
      if (existingUserByEmail) {
        res.status(400).json({ error: 'Email is already in use. Please try another or log into your existing account.' });
        return;
      }
    } catch (error) {
      // User not found, which is what we want
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ 
        error: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.' 
      });
      return;
    }

    // Create user in Firebase Auth
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      emailVerified: true // Set to true since we're not requiring verification
    });

    await admin.auth().setCustomUserClaims(user.uid, { role: 'guardian' });

    // Store user data in Firestore
    await db.collection('users').doc(user.uid).set({
      email,
      name,
      phoneNumber,
      role: 'guardian',
      loginAttempts: 0,
      lockedUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate custom token for the new user
    const customToken = await admin.auth().createCustomToken(user.uid);

    res.status(201).json({ 
      success: true,
      userId: user.uid,
      customToken,
      message: 'Registration successful.'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Check if user exists
    const user = await admin.auth().getUserByEmail(email);

    // Check account lock status
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.lockedUntil && userData.lockedUntil > Date.now()) {
      res.status(403).json({ 
        error: 'Account is locked. Please try again later or reset your password.',
        lockedUntil: userData.lockedUntil
      });
      return;
    }

    try {
      // Verify password (this would typically be handled by Firebase Client SDK)
      // Here we're using custom token as a workaround
      const customToken = await admin.auth().createCustomToken(user.uid);

      // Reset login attempts on successful login
      await db.collection('users').doc(user.uid).update({
        loginAttempts: 0,
        lockedUntil: null
      });

      res.status(200).json({ 
        success: true,
        customToken,
        userId: user.uid
      });
    } catch (error) {
      // Increment login attempts
      const newAttempts = (userData?.loginAttempts || 0) + 1;
      const updates: any = { loginAttempts: newAttempts };
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = Date.now() + LOCK_TIME;
      }

      await db.collection('users').doc(user.uid).update(updates);

      res.status(401).json({ 
        error: 'Incorrect login credentials. Please try again.',
        remainingAttempts: MAX_LOGIN_ATTEMPTS - newAttempts
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Check if already verified
    if (user.emailVerified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    // Check cooldown period (30 seconds)
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const lastEmailSent = userData?.lastVerificationEmailSent?.toMillis() || 0;
    const cooldownPeriod = 30 * 1000; // 30 seconds in milliseconds

    if (lastEmailSent && Date.now() - lastEmailSent < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - lastEmailSent)) / 1000);
      res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting another verification email.` 
      });
      return;
    }

    // Send verification email
    const verificationLink = await sendVerificationEmail(email);

    // Update last email sent timestamp
    await db.collection('users').doc(user.uid).update({
      lastVerificationEmailSent: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent successfully',
      verificationLink // Only included for testing/development
    });
  } catch (error: any) {
    console.error('Error in resendVerification:', error);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email);
    res.status(200).json({ 
      success: true,
      resetLink
    });
  } catch (error) {
    next(error);
  }
};