"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getToken } from '@/lib/auth/authService';
import { Chat } from '../../types/chat';

interface Message {
  id: string;
  sender: {
    name: string;
    role: string;
    center: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  isSentByParent?: boolean;
}

interface Teacher {
  name: string;
  role: string;
  center: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  bookingId?: string;  // Added for new booking chats
}

export default function MessagesPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    "Ms. Johnson": [
      {
        id: "1",
        sender: {
          name: "Ms. Johnson",
          role: "Sunshine Room Teacher",
          center: "Online",
          avatar: "MJ"
        },
        content: "Good afternoon! I wanted to let you know that Emma had a wonderful day today. She participated enthusiastically in our art project and made some beautiful paintings.",
        timestamp: "7:30 PM",
        isRead: true
      },
      {
        id: "2",
        sender: {
          name: "Parent",
          role: "",
          center: "",
          avatar: "P"
        },
        content: "That's great to hear! She's been talking about the art class all week. Did she eat her lunch today?",
        timestamp: "7:35 PM",
        isRead: true
      },
      {
        id: "3",
        sender: {
          name: "Ms. Johnson",
          role: "Sunshine Room Teacher",
          center: "Online",
          avatar: "MJ"
        },
        content: "Yes, she ate most of her lunch today. She particularly enjoyed the fruit and yogurt. She's been making good progress with using her spoon properly.",
        timestamp: "7:38 PM",
        isRead: true
      },
      {
        id: "4",
        sender: {
          name: "Ms. Johnson",
          role: "Sunshine Room Teacher",
          center: "Online",
          avatar: "MJ"
        },
        content: "Also, we're planning a small celebration for spring next week. We'll be sending out details soon, but wanted to give you a heads up!",
        timestamp: "7:39 PM",
        isRead: true
      }
    ],
    "Mr. Davis": [
      {
        id: "1",
        sender: {
          name: "Mr. Davis",
          role: "Bright Stars Teacher",
          center: "Online",
          avatar: "MD"
        },
        content: "Hello! I wanted to update you about Noah's progress in our number recognition activities. He's doing really well!",
        timestamp: "Yesterday, 2:15 PM",
        isRead: false
      },
      {
        id: "2",
        sender: {
          name: "Parent",
          role: "",
          center: "",
          avatar: "P"
        },
        content: "That's wonderful to hear! He's been practicing counting at home too. How is he doing with making friends?",
        timestamp: "Yesterday, 2:20 PM",
        isRead: true
      },
      {
        id: "3",
        sender: {
          name: "Mr. Davis",
          role: "Bright Stars Teacher",
          center: "Online",
          avatar: "MD"
        },
        content: "Noah is very social and gets along well with everyone. He particularly enjoys group activities and always helps other children.",
        timestamp: "Yesterday, 2:25 PM",
        isRead: false
      }
    ],
    "Sunshine Daycare Admin": [
      {
        id: "1",
        sender: {
          name: "Sunshine Daycare Admin",
          role: "Administrative Staff",
          center: "Online",
          avatar: "SA"
        },
        content: "Your payment for March has been processed successfully. The receipt has been sent to your email.",
        timestamp: "Mar 24, 10:00 AM",
        isRead: true
      }
    ],
    "Ms. Garcia": [
      {
        id: "1",
        sender: {
          name: "Ms. Garcia",
          role: "Activities Coordinator",
          center: "Online",
          avatar: "MG"
        },
        content: "We're planning an exciting field trip to the local farm next month! Would Emma be interested in joining?",
        timestamp: "Mar 22, 3:45 PM",
        isRead: true
      },
      {
        id: "2",
        sender: {
          name: "Parent",
          role: "",
          center: "",
          avatar: "P"
        },
        content: "That sounds wonderful! Emma loves animals. Could you please share more details about the trip?",
        timestamp: "Mar 22, 4:00 PM",
        isRead: true
      }
    ],
    "Bright Stars Center Admin": [
      {
        id: "1",
        sender: {
          name: "Bright Stars Center Admin",
          role: "Administrative Staff",
          center: "Offline",
          avatar: "BA"
        },
        content: "Your booking request for Noah has been received. We'll review it and get back to you within 24 hours.",
        timestamp: "Mar 20, 11:30 AM",
        isRead: true
      }
    ]
  });

  // Function to fetch chats
  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('[MessagesPage] Not authenticated');
        setError('You must be logged in to view messages');
        return;
      }

      const response = await fetch('http://localhost:3001/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const fetchedChats = await response.json();
      console.log('[MessagesPage] Fetched chats:', fetchedChats);

      // Filter out chats for completed or cancelled bookings
      const activeChats = fetchedChats.filter((chat: Chat) => {
        if (!chat.bookingId) return true; // Keep chats without bookings
        return true; // Backend now handles filtering
      });

      setChats(activeChats);

      // Convert chats to teachers format
      const teachersFromChats = activeChats.map((chat: Chat) => ({
        name: chat.teacherName,
        role: chat.role,
        center: chat.center,
        lastMessage: chat.lastMessage || 'No messages yet',
        time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : '',
        unread: false,
        bookingId: chat.bookingId
      }));

      setTeachers(teachersFromChats);
      setFilteredTeachers(teachersFromChats);
    } catch (error) {
      console.error('[MessagesPage] Error fetching chats:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chats when component mounts
  useEffect(() => {
    fetchChats();
  }, []);

  // Subscribe to booking cancellations
  useEffect(() => {
    const checkForCancelledBookings = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch('http://localhost:3001/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const bookings = await response.json();
        const cancelledBookingIds = new Set(bookings.cancelled.map((b: any) => b.id));

        // Remove chats for cancelled bookings
        setTeachers(prevTeachers => 
          prevTeachers.filter(teacher => 
            !teacher.bookingId || !cancelledBookingIds.has(teacher.bookingId)
          )
        );

        setChats(prevChats =>
          prevChats.filter(chat =>
            !chat.bookingId || !cancelledBookingIds.has(chat.bookingId)
          )
        );

      } catch (error) {
        console.error('Error checking for cancelled bookings:', error);
      }
    };

    // Check initially and then every minute
    checkForCancelledBookings();
    const interval = setInterval(checkForCancelledBookings, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter teachers based on search query
  useEffect(() => {
    const filtered = teachers.filter(teacher => {
      const searchString = `${teacher.name} ${teacher.role} ${teacher.center} ${teacher.lastMessage}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  // Function to add a new chat when a booking is created
  const addNewBookingChat = (bookingDetails: {
    teacherName: string;
    role: string;
    center: string;
    bookingId: string;
  }) => {
    const newTeacher: Teacher = {
      name: bookingDetails.teacherName,
      role: bookingDetails.role,
      center: bookingDetails.center,
      lastMessage: "New booking created. Start your conversation!",
      time: new Date().toLocaleTimeString(),
      unread: false,
      bookingId: bookingDetails.bookingId
    };

    setTeachers(prev => [newTeacher, ...prev]);
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('[MessagesPage] Not authenticated');
        setError('You must be logged in to view messages');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MessagesPage] Error fetching messages:', errorText);
        setError('Unable to load messages. Please try again later.');
        return;
      }

      const messages = await response.json();
      console.log('[MessagesPage] Received messages:', messages);
      
      // Format the messages with proper timestamps
      const formattedMessages = messages.map((msg: any) => {
        let formattedTimestamp;
        try {
          const timestamp = msg.timestamp?._seconds 
            ? new Date(msg.timestamp._seconds * 1000) 
            : new Date(msg.timestamp);

          if (!isNaN(timestamp.getTime())) {
            formattedTimestamp = timestamp.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
              month: 'short',
              day: 'numeric'
            });
          } else {
            formattedTimestamp = 'Just now';
          }
        } catch (error) {
          console.error('Error formatting message timestamp:', error);
          formattedTimestamp = 'Just now';
        }

        return {
          id: msg.id,
          sender: {
            name: "Parent",
            role: "",
            center: "",
            avatar: "P"
          },
          content: msg.content,
          timestamp: formattedTimestamp,
          isRead: msg.isRead || false,
          isSentByParent: true
        };
      });

      // Sort messages by timestamp
      const sortedMessages = formattedMessages.sort((a: Message, b: Message) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      return sortedMessages;
    } catch (error) {
      console.error('[MessagesPage] Error fetching messages:', error);
      setError('Unable to load messages. Please check your internet connection.');
      return [];
    }
  };

  const sendMessage = async () => {
    if (!selectedTeacher || !newMessage.trim()) return;

    try {
      // Find the selected chat
      const selectedChat = chats.find(chat => chat.teacherName === selectedTeacher);
      if (!selectedChat) {
        console.error('[MessagesPage] No chat found for selected teacher');
        return;
      }

      const token = await getToken();
      if (!token) {
        console.error('[MessagesPage] Not authenticated');
        setError('You must be logged in to send messages');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: newMessage
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MessagesPage] Error sending message:', errorText);
        setError('Failed to send message. Please try again.');
        return;
      }

      const sentMessage = await response.json();
      
      // Update local state with the new message
      const newMessageObj: Message = {
        id: sentMessage.id || Date.now().toString(),
        sender: {
          name: "Parent",
          role: "",
          center: "",
          avatar: "P"
        },
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
        isSentByParent: true
      };

      // Update conversations state
      setConversations(prev => {
        const existingMessages = prev[selectedTeacher] || [];
        const welcomeMessage = existingMessages.find(msg => msg.id === 'welcome');
        const otherMessages = existingMessages.filter(msg => msg.id !== 'welcome');
        
        return {
          ...prev,
          [selectedTeacher]: welcomeMessage 
            ? [welcomeMessage, ...otherMessages, newMessageObj]
            : [...otherMessages, newMessageObj]
        };
      });

      // Clear the input
      setNewMessage("");
    } catch (error) {
      console.error('[MessagesPage] Error sending message:', error);
      setError('Failed to send message. Please check your internet connection.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Update conversations when a new chat is selected
  useEffect(() => {
    if (selectedTeacher) {
      // Find the selected chat
      const selectedChat = chats.find(chat => chat.teacherName === selectedTeacher);
      if (selectedChat?.id) {
        const loadMessages = async () => {
          const messages = await fetchChatMessages(selectedChat.id);
          // Always include welcome message at the start
          const welcomeMessage = {
            id: "welcome",
            sender: {
              name: selectedTeacher,
              role: selectedChat.role,
              center: selectedChat.center,
              avatar: selectedTeacher[0].toUpperCase()
            },
            content: "Welcome to your chat! You can start messaging with the childcare center staff here.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            isSentByParent: false // Only welcome message is from teacher
          };

          setConversations(prev => ({
            ...prev,
            [selectedTeacher]: [welcomeMessage, ...(messages || [])]
          }));
        };
        loadMessages();
      }
    }
  }, [selectedTeacher, chats]);

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Messages</h1>
      </div>
      <div className="flex h-[calc(100vh-4rem-4rem)]">
        {/* Teachers List */}
        <div className="w-1/3 border-r bg-background">
          <div className="p-6">
            <div className="space-y-4">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading chats...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : teachers.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No chats available. Create a booking to start chatting!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.name}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors duration-200 ${
                        selectedTeacher === teacher.name 
                        ? "bg-accent border-accent-foreground/20" 
                        : "hover:bg-accent/50 border-transparent"
                      }`}
                      onClick={() => setSelectedTeacher(teacher.name)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <span>{teacher.name[0]}</span>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium truncate">{teacher.name}</p>
                            <span className="text-xs text-muted-foreground">{teacher.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {teacher.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedTeacher ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <span>{selectedTeacher[0]}</span>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedTeacher}</h3>
                    <p className="text-sm text-muted-foreground">
                      {teachers.find(t => t.name === selectedTeacher)?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversations[selectedTeacher]?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.isSentByParent ? "justify-end" : ""
                    }`}
                  >
                    {!message.isSentByParent && (
                      <Avatar>
                        <span>{message.sender.avatar}</span>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.isSentByParent
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/30 border border-accent-foreground/10"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isSentByParent 
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                    {message.isSentByParent && (
                      <Avatar>
                        <span>P</span>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card shadow-sm">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-background"
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
} 