import { getToken } from '../auth/authService';

const API_URL = 'http://localhost:3001/api/children';

export interface Child {
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

export const getChildren = async (): Promise<Child[]> => {
  try {
    const token = await getToken();
    if (!token) {
      console.log('[getChildren] No authentication token available');
      throw new Error('Not authenticated');
    }

    console.log('[getChildren] Fetching children with token');
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('[getChildren] Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        contentType
      });

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('[getChildren] JSON error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch children');
      } else {
        console.error('[getChildren] Non-JSON error response');
        throw new Error(`Server error (${response.status}): Please ensure the backend server is running on port 3001`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[getChildren] Invalid content type:', contentType);
      throw new Error('Invalid response from server: Expected JSON data');
    }

    const children = await response.json();
    console.log('[getChildren] Successfully fetched children:', {
      count: children.length,
      childrenIds: children.map((c: Child) => c.id)
    });

    // Validate that each child has an ID
    const validChildren = children.filter((child: Child) => child.id);
    if (validChildren.length !== children.length) {
      console.warn('[getChildren] Some children are missing IDs:', {
        total: children.length,
        valid: validChildren.length
      });
    }

    return validChildren;
  } catch (error: any) {
    console.error('[getChildren] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server: Please ensure the backend server is running on port 3001');
    }
    throw error;
  }
};

export const getChild = async (id: string): Promise<Child> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch child');
  }

  return response.json();
};

export const createChild = async (child: Omit<Child, 'id' | 'parentId'>): Promise<Child> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(child)
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child');
      } else {
        throw new Error(`Server error (${response.status}): Please ensure the backend server is running on port 3001`);
      }
    }

    return response.json();
  } catch (error: any) {
    console.error('Create child error details:', error);
    throw new Error(error.message || 'Failed to create child');
  }
};

export const updateChild = async (id: string, child: Partial<Child>): Promise<Child> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(child)
  });

  if (!response.ok) {
    throw new Error('Failed to update child');
  }

  return response.json();
};

export const deleteChild = async (id: string): Promise<void> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete child');
  }
}; 