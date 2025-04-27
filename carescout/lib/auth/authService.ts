// e.g. in src/lib/auth/authService.ts or wherever you keep it

import { auth } from "@/config/firebase-client"
import { 
  signInWithCustomToken as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

const API_URL = 'http://localhost:3001/api';

interface AuthError {
  message: string;
  code?: string;
  remainingAttempts?: number;
  lockedUntil?: number;
}

/**
 * Logs in an existing user by sending email + password to the backend.
 * The backend returns a custom token if credentials are valid.
 */
export async function loginWithBackend(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      const error: AuthError = {
        message: data.error || 'Login failed'
      };

      if (data.remainingAttempts !== undefined) {
        error.code = 'invalid-credentials';
        error.remainingAttempts = data.remainingAttempts;
      }

      if (data.lockedUntil) {
        error.code = 'account-locked';
        error.lockedUntil = data.lockedUntil;
      }

      throw error;
    }

    return data.customToken;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * Registers a new user by sending email, password, name and phone
 * to the backend. The backend creates a user, returning a custom token.
 */
export async function registerWithBackend(email: string, password: string, name: string, phoneNumber: string) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data.customToken;
  } catch (error: any) {
    console.error('Registration failed:', error);
    throw error;
  }
}

/**
 * Takes a custom token (returned by login/register calls),
 * signs in with Firebase client SDK, and returns the final ID token.
 */
export async function signInWithCustomToken(customToken: string) {
  const userCredential = await firebaseSignIn(auth, customToken);
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}

export async function logout() {
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    await firebaseSignOut(auth);
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export const storeToken = (token: string) => {
  localStorage.setItem('token', token);
  sessionStorage.setItem('token', token);
};

export const refreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const newToken = await user.getIdToken(true); // Force refresh
      storeToken(newToken);
      return newToken;
    }
    throw new Error('No user logged in');
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearToken();
    window.location.href = '/auth/login';
    throw error;
  }
};

export const getToken = async () => {
  try {
    console.log('[getToken] Starting token retrieval');
    const user = auth.currentUser;
    console.log('[getToken] Current user:', user ? 'Exists' : 'None');
    
    if (!user) {
      console.log('[getToken] No current user, checking storage');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('[getToken] Stored token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('[getToken] No token found, clearing and redirecting');
        clearToken();
        return null;
      }
      return token;
    }
    
    // Get a fresh token if needed
    console.log('[getToken] Getting fresh token from Firebase');
    const token = await user.getIdToken(false);
    console.log('[getToken] Got fresh token:', token ? 'Success' : 'Failed');
    storeToken(token);
    return token;
  } catch (error) {
    console.error('[getToken] Error:', error);
    return await refreshToken();
  }
};

export const clearToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '/login';
};