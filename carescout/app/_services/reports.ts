import { Report } from '../types/report';
import { getToken } from '@/lib/auth/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getChildReports = async (childId: string): Promise<Report[]> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/reports/child/${childId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch child reports');
  }

  return response.json();
};

export const getUserChildrenReports = async (): Promise<{ [key: string]: Report[] }> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/reports/user/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Try to get more detailed error information
      const errorData = await response.json().catch(() => null);
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Failed to fetch user children reports: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getUserChildrenReports:', error);
    throw error;
  }
}; 