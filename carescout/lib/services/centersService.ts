import { getToken } from '../auth/authService';

const API_URL = 'http://localhost:3001/api';

export interface Center {
  id: string;
  name: string;
  address: string;
  rating?: number;
  openingHours?: string;
  description?: string;
  capacity?: number;
  ageRange?: {
    Min: number;
    Max: number;
  };
  fees?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
}

export interface BookingData {
  childId: string;
  startDate: string;
  endDate: string;
}

export const getCenters = async (): Promise<Center[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/centers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch centers');
      } else {
        throw new Error(`Server error (${response.status}): Please ensure the backend server is running on port 3001`);
      }
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching centers:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server: Please ensure the backend server is running on port 3001');
    }
    throw error;
  }
};

export const getCenter = async (id: string): Promise<Center> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/centers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch center');
      } else {
        throw new Error(`Server error (${response.status}): Please ensure the backend server is running on port 3001`);
      }
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching center:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server: Please ensure the backend server is running on port 3001');
    }
    throw error;
  }
};

export const bookCenter = async (centerId: string, bookingData: BookingData): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('[bookCenter] Sending request:', {
      centerId,
      childId: bookingData.childId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate
    });

    const response = await fetch(`${API_URL}/centers/${centerId}/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    let responseData;
    try {
      responseData = await response.json();
      console.log('[bookCenter] Response data:', responseData);
    } catch (parseError) {
      console.error('[bookCenter] Failed to parse response:', parseError);
      throw new Error('Server returned invalid response');
    }

    if (!response.ok) {
      // Handle specific error cases from the backend
      const errorMessage = responseData?.error || 'Failed to book center';
      console.error('[bookCenter] Request failed:', {
        status: response.status,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }

    // Validate successful response has the expected format
    if (!responseData?.booking?.id) {
      console.error('[bookCenter] Invalid success response:', responseData);
      throw new Error('Invalid booking response from server');
    }

    console.log('[bookCenter] Booking successful:', {
      bookingId: responseData.booking.id,
      status: responseData.booking.status
    });

    return responseData.booking;
  } catch (error: any) {
    // Log the complete error information
    console.error('[bookCenter] Error:', {
      message: error.message,
      originalError: error
    });

    // Handle specific error cases
    if (!error.message || error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server: Please check your internet connection');
    }

    // For other errors, preserve the original error message
    throw error;
  }
}; 