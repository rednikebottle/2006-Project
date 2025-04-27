"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getToken } from '@/lib/auth/authService';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function BookingsPage() {
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('[BookingsPage] Starting to fetch bookings...');
        const token = await getToken();
        console.log('[BookingsPage] Got auth token:', !!token);

        if (!token) throw new Error('Not authenticated');

        console.log('[BookingsPage] Making API request...');
        const response = await fetch('http://localhost:3001/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[BookingsPage] API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[BookingsPage] Error response:', errorText);
          throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
        }

        const bookings = await response.json();
        console.log('[BookingsPage] Raw API response:', bookings);

        // Check if bookings is an object with the expected structure
        if (bookings && typeof bookings === 'object' && 'current' in bookings) {
          console.log('[BookingsPage] Setting current bookings:', bookings.current);
          
          // Filter out and auto-complete past bookings
          const now = new Date();
          const currentBookings = bookings.current || [];
          const currentBookingsFiltered: Booking[] = [];
          const autoCompletedBookings: Booking[] = [];

          currentBookings.forEach((booking: Booking) => {
            if (new Date(booking.endDate) < now) {
              autoCompletedBookings.push({ ...booking, status: 'completed' as const });
            } else {
              currentBookingsFiltered.push(booking);
            }
          });

          setCurrentBookings(currentBookingsFiltered);
          setPastBookings([...autoCompletedBookings, ...(bookings.past || [])]);
          setCancelledBookings(bookings.cancelled || []);
        } else {
          console.log('[BookingsPage] Unexpected response format, initializing empty arrays');
          setCurrentBookings([]);
          setPastBookings([]);
          setCancelledBookings([]);
        }
      } catch (err) {
        console.error('[BookingsPage] Error details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!selectedBooking) return;

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // Cancel the booking
      const response = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const result = await response.json();

      // Delete the associated chat
      try {
        const chatResponse = await fetch(`http://localhost:3001/api/chats/booking/${selectedBooking.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!chatResponse.ok) {
          console.error('Failed to delete associated chat');
        }
      } catch (chatError) {
        console.error('Error deleting chat:', chatError);
      }

      // Move the booking from current to cancelled
      setCurrentBookings(currentBookings.filter(b => b.id !== selectedBooking.id));
      setCancelledBookings([...cancelledBookings, { ...selectedBooking, status: 'cancelled' }]);

      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('[BookingsPage] Error cancelling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newStartDate || !selectedTime) return;

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // Create the start and end dates
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDate = new Date(newStartDate);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      const response = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule booking');
      }

      // Update the booking dates in the local state
      setCurrentBookings(currentBookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { 
              ...booking, 
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              status: 'confirmed'
            }
          : booking
      ));

      setIsRescheduleDialogOpen(false);
      setSelectedBooking(null);
      setNewStartDate(undefined);
      setSelectedTime('');
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to reschedule booking');
    }
  };

  const handleComplete = async () => {
    if (!selectedBooking) return;

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      console.log('[BookingsPage] Completing booking:', selectedBooking.id);
      const response = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('[BookingsPage] Complete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BookingsPage] Error response:', errorText);
        throw new Error('Failed to complete booking');
      }

      // Move the booking from current to past bookings
      const completedBooking = { ...selectedBooking, status: 'completed' as const };
      setCurrentBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
      setPastBookings(prev => [completedBooking, ...prev]);

      setSelectedBooking(null);
    } catch (err) {
      console.error('[BookingsPage] Error completing booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "rescheduled":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Bookings</h1>
      </div>
      <div className="container mx-auto p-4 h-[calc(100vh-4rem-4rem)]">
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid gap-4">
              {currentBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p>No current bookings found.</p>
                  </CardContent>
                </Card>
              ) : (
                currentBookings.map((booking) => (
                <Card key={`current-${booking.id}-${booking.status}`}>
                  <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{booking.centerName}</span>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                        <p><strong>Child:</strong> {booking.childName}</p>
                        <p><strong>Start:</strong> {format(new Date(booking.startDate), 'PPP p')}</p>
                        <p><strong>End:</strong> {format(new Date(booking.endDate), 'PPP p')}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsRescheduleDialogOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsCancelDialogOpen(true);
                          }}
                        >
                          Cancel
                        </Button>
                        {new Date(booking.endDate) >= new Date() && (
                          <Button
                            variant="default"
                            onClick={() => {
                              setSelectedBooking(booking);
                              handleComplete();
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
                    </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid gap-4">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p>No past bookings found.</p>
                  </CardContent>
                </Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={`past-${booking.id}-${booking.status}`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{booking.centerName}</span>
                        <Badge variant="outline">Completed</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Child:</strong> {booking.childName}</p>
                        <p><strong>Start:</strong> {format(new Date(booking.startDate), 'PPP p')}</p>
                        <p><strong>End:</strong> {format(new Date(booking.endDate), 'PPP p')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="grid gap-4">
              {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                    <p>No cancelled bookings found.</p>
              </CardContent>
            </Card>
              ) : (
                cancelledBookings.map((booking) => (
                <Card key={`cancelled-${booking.id}-${booking.status}`}>
                  <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{booking.centerName}</span>
                      <Badge variant="destructive">Cancelled</Badge>
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                        <p><strong>Child:</strong> {booking.childName}</p>
                        <p><strong>Start:</strong> {format(new Date(booking.startDate), 'PPP p')}</p>
                        <p><strong>End:</strong> {format(new Date(booking.endDate), 'PPP p')}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsRescheduleDialogOpen(true);
                          }}
                        >
                          Book Again
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                No, keep booking
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                Yes, cancel booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Booking</DialogTitle>
              <DialogDescription>
                Please select a new date and time for your booking.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !newStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newStartDate ? format(newStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="flex w-auto flex-col space-y-2 p-2">
                    <div className="rounded-md border">
                      <Calendar
                        mode="single"
                        selected={newStartDate}
                        onSelect={setNewStartDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          day_range_end: "day-range-end",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "day-outside text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_hidden: "invisible"
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Select 
                onValueChange={setSelectedTime}
                disabled={!newStartDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 9).map((hour) => {
                    const isDisabled = newStartDate?.toDateString() === new Date().toDateString() && 
                      hour <= new Date().getHours();
                    
                    return (
                      <SelectItem 
                        key={hour} 
                        value={`${hour}:00`}
                        disabled={isDisabled}
                      >
                        {`${hour}:00`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsRescheduleDialogOpen(false);
                setNewStartDate(undefined);
                setSelectedTime('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={!newStartDate || !selectedTime}
              >
                Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 