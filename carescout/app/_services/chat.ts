import { getToken } from '@/lib/auth/authService';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  bookingId?: string;
  teacherName: string;
  role: string;
  center: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messages: ChatMessage[];
}

export const createChatForBooking = async (bookingId: string, centerDetails: {
  teacherName: string;
  role: string;
  center: string;
}): Promise<Chat> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        teacherName: centerDetails.teacherName,
        role: centerDetails.role,
        center: centerDetails.center,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getChats = async (): Promise<Chat[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/chats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const chats = await response.json();
    
    // Sort chats by last message time, most recent first
    return chats.sort((a: Chat, b: Chat) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

export const sendMessage = async (chatId: string, content: string): Promise<ChatMessage> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/chats/${chatId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Add a function to check if a chat should be visible
export const shouldShowChat = (chat: Chat): boolean => {
  if (!chat.bookingId) return true; // Show chats without bookings
  const booking = chat.booking;
  return booking && booking.status !== 'completed' && booking.status !== 'cancelled';
}; 