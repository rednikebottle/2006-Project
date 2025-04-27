// authenticate.ts (or wherever)

import { loginWithBackend, signInWithCustomToken } from './authService';

// If you want to log in a specific user:
async function authenticateAndGetIdToken() {
  try {
    // Provide email & password
    const email = 'testuser@example.com';
    const password = 'test123';

    // Step 1: login, which returns a custom token
    const customToken = await loginWithBackend(email, password);

    if (!customToken) {
      console.error('Failed to get custom token');
      return;
    }

    // Step 2: Sign in with the custom token to get the Firebase ID token
    const idToken = await signInWithCustomToken(customToken);

    console.log('ID Token:', idToken);

    // Step 3: Send ID token to backend for authenticated requests
    await sendAuthenticatedRequest(idToken);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// Example function to send ID token in the Authorization header
async function sendAuthenticatedRequest(idToken: string) {
  try {
    const response = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,  // Send ID token 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        centreId: 'centre-id',  
        date: '2025-04-09T10:00:00.000Z',
        status: 'pending',
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error sending authenticated request:', error);
  }
}
