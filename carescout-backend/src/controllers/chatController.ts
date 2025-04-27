import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp;
  isRead: boolean;
}

interface Chat {
  id: string;
  bookingId?: string;
  teacherName: string;
  role: string;
  center: string;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  messages: ChatMessage[];
  participants: string[];
}

export const createChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookingId, teacherName, role, center } = req.body;

    // Verify the booking belongs to the user
    if (bookingId) {
      const bookingDoc = await db.collection('bookings').doc(bookingId).get();
      if (!bookingDoc.exists || bookingDoc.data()?.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to create chat for this booking' });
      }
    }

    // Create a new chat document
    const chatRef = db.collection('chats').doc();
    const chat: Chat = {
      id: chatRef.id,
      bookingId,
      teacherName,
      role,
      center,
      participants: [userId],
      messages: [],
    };

    await chatRef.set(chat);
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

export const getChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    console.log('[ChatController] Getting chats for user:', userId);

    if (!userId) {
      console.log('[ChatController] No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[ChatController] Querying chats collection...');
    const chatsSnapshot = await db.collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    console.log('[ChatController] Found chats:', chatsSnapshot.size);
    
    // Get all chats first
    const chatsWithBookings = await Promise.all(chatsSnapshot.docs.map(async doc => {
      const data = doc.data();
      console.log('[ChatController] Chat data:', { id: doc.id, ...data });

      // Get the booking status
      const bookingId = data.bookingId;
      if (bookingId) {
        const bookingDoc = await db.collection('bookings').doc(bookingId).get();
        if (bookingDoc.exists) {
          const bookingData = bookingDoc.data();
          // Only include chat if booking is not completed and not cancelled
          if (bookingData && bookingData.status !== 'completed' && bookingData.status !== 'cancelled') {
            return {
              id: doc.id,
              ...data
            };
          }
        }
      }
      return null;
    }));

    // Filter out null values (chats with completed/cancelled bookings)
    const activeChats = chatsWithBookings.filter(chat => chat !== null);

    console.log('[ChatController] Returning active chats:', activeChats);
    res.json(activeChats);
  } catch (error) {
    console.error('[ChatController] Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chatId = req.params.chatId;
    const { content } = req.body;

    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatDoc.data() as Chat;
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      senderId: 'parent',
      receiverId: chat.participants.find(p => p !== userId) || '',
      timestamp: Timestamp.now(),
      isRead: false,
    };

    await chatRef.update({
      messages: [...chat.messages, message],
      lastMessage: content,
      lastMessageTime: message.timestamp,
    });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chatId = req.params.chatId;
    const chatDoc = await db.collection('chats').doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatDoc.data() as Chat;
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to view messages in this chat' });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const deleteChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chatId = req.params.chatId;
    console.log('[ChatController] Attempting to delete chat:', chatId);

    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      console.log('[ChatController] Chat not found:', chatId);
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatDoc.data() as Chat;
    if (!chat.participants.includes(userId)) {
      console.log('[ChatController] User not authorized to delete chat:', { userId, chatId });
      return res.status(403).json({ error: 'Not authorized to delete this chat' });
    }

    await chatRef.delete();
    console.log('[ChatController] Successfully deleted chat:', chatId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('[ChatController] Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
}; 