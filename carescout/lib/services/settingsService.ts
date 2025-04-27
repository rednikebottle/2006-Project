import { getToken } from '../auth/authService';

const API_URL = 'http://localhost:3001/api/settings';

export interface UserSettings {
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

export async function getSettings(): Promise<UserSettings> {
  try {
    console.log('[getSettings] Starting settings fetch');
    const token = await getToken();
    console.log('[getSettings] Token status:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('[getSettings] No token available');
      throw new Error('Not authenticated');
    }

    console.log('[getSettings] Making API request');
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('[getSettings] Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getSettings] Error response:', errorText);
      throw new Error('Failed to fetch settings');
    }
    
    const data = await response.json();
    console.log('[getSettings] Successfully fetched settings');
    return data;
  } catch (error) {
    console.error('[getSettings] Error details:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      throw new Error('Please log in again to continue.');
    }
    throw new Error('Failed to fetch settings. Please ensure you are logged in and try again.');
  }
}

export async function updateProfile(data: { name: string; phone: string }): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile. Please ensure the backend server is running on port 3001.');
  }
}

export async function updateNotifications(notifications: UserSettings['notifications']): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notifications }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update notifications');
    }

    // Parse response to ensure it's valid
    await response.json();
  } catch (error) {
    console.error('Error updating notifications:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update notifications. Please ensure the backend server is running on port 3001.');
  }
}

export async function updatePreferences(preferences: UserSettings['preferences']): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });
    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw new Error('Failed to update preferences. Please ensure the backend server is running on port 3001.');
  }
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update password');
    }
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Failed to update password. Please ensure the backend server is running on port 3001.');
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account. Please ensure the backend server is running on port 3001.');
  }
} 