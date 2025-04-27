"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { getToken } from '@/lib/auth/authService';

interface Activity {
  type: string;
  child: string;
  description: string;
  timeAgo: string;
}

interface Notification {
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface Booking {
  id: string;
  centerId: string;
  centerName: string;
  childName: string;
  startDate: string;
  endDate: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "rescheduled";
  userId?: string;
}

interface ChildBookingCount {
  childName: string;
  count: number;
}

export default function DashboardPage() {
  const [activeBookings, setActiveBookings] = useState<ChildBookingCount[]>([]);
  const [activities] = useState<Activity[]>([
    {
      type: "Art Class",
      child: "Dhruv",
      description: "created spring-themed paintings",
      timeAgo: "2 hours ago"
    },
    {
      type: "Outdoor Play",
      child: "Dhruv",
      description: "participated in group activities in the playground",
      timeAgo: "3 hours ago"
    },
    {
      type: "Storytime",
      child: "Dhruv",
      description: "enjoyed an interactive storytelling session",
      timeAgo: "5 hours ago"
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      title: "Booking Confirmed",
      message: "Your booking for Dhruv at YUQUAN PRESCHOOL @GUILLEMARD has been confirmed for next Monday.",
      time: "Today, 7:30 PM",
      isRead: false
    },
    {
      title: "New Daily Report",
      message: "Dhruv's daily report for today is now available. Check it out!",
      time: "Today, 4:15 PM",
      isRead: false
    },
    {
      title: "Message from Teacher",
      message: "Ms. Johnson sent you a message regarding Dhruv's progress.",
      time: "Yesterday, 5:45 PM",
      isRead: false
    }
  ]);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch('http://localhost:3001/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        
        if (bookings && typeof bookings === 'object' && 'current' in bookings) {
          // Count bookings per child
          const bookingCounts: { [key: string]: number } = {};
          bookings.current.forEach((booking: Booking) => {
            if (!bookingCounts[booking.childName]) {
              bookingCounts[booking.childName] = 0;
            }
            bookingCounts[booking.childName]++;
          });

          // Convert to array format
          const countsArray = Object.entries(bookingCounts).map(([childName, count]) => ({
            childName,
            count
          }));

          setActiveBookings(countsArray);
        }
      } catch (err) {
        console.error('Error fetching active bookings:', err);
      }
    };

    // Initial fetch
    fetchActiveBookings();

    // Set up WebSocket connection for real-time updates
    const setupWebSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const ws = new WebSocket(`ws://localhost:3001/ws/bookings?token=${token}`);

        ws.onopen = () => {
          console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'booking_update') {
            // Refresh bookings when there's an update
            fetchActiveBookings();
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          // Attempt to reconnect after a delay
          setTimeout(setupWebSocket, 5000);
        };

        return () => {
          ws.close();
        };
      } catch (err) {
        console.error('Error setting up WebSocket:', err);
      }
    };

    setupWebSocket();
  }, []);

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Dashboard</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeBookings.reduce((total, child) => total + child.count, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeBookings.length === 0 ? (
                      <div>No active bookings for any child</div>
                    ) : (
                      activeBookings.map((child, index) => (
                        <div key={index}>
                          {child.count} upcoming booking{child.count !== 1 ? 's' : ''} for {child.childName}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">From all centers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">New Daily Reports</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Updated today at 4:30 PM</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <p className="text-sm text-muted-foreground">Latest activities for your children</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <span className="text-xs">{activity.type[0]}</span>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.child} {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.map((notification, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <button className="text-sm text-muted-foreground hover:text-primary">
                      Mark as read
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>MONTESSORI @ GRACELAND PTE LTD</CardTitle>
                <p className="text-sm text-muted-foreground">Child: Dhruv</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">March 28, 2025, 8:00 AM - 5:00 PM</p>
                <p className="text-sm text-muted-foreground">Status: Confirmed</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-sm text-blue-500 hover:text-blue-600">Reschedule</button>
                  <button className="text-sm text-red-500 hover:text-red-600">Cancel</button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>YUQUAN PRESCHOOL @GUILLEMARD</CardTitle>
                <p className="text-sm text-muted-foreground">Child: Dhruv</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">April 1, 2025, 8:00 AM - 4:00 PM</p>
                <p className="text-sm text-muted-foreground">Status: Pending Approval</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-sm text-blue-500 hover:text-blue-600">Reschedule</button>
                  <button className="text-sm text-red-500 hover:text-red-600">Cancel</button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 