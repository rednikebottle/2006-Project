'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DayPicker } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCenter, bookCenter, type Center } from '@/lib/services/centersService';
import { getChildren, type Child } from '@/lib/services/childrenService';
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';
import "react-day-picker/dist/style.css";
import ReviewSection from '@/components/ReviewSection';
import { getToken } from '@/lib/auth/authService';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00'
];

// Type guard to check if a child has an ID
function hasValidId(child: Child): child is Child & { id: string } {
  return typeof child.id === 'string' && child.id.length > 0;
}

export default function CenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [center, setCenter] = useState<Center | null>(null);
  const [children, setChildren] = useState<(Child & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<string>('');

  const today = new Date();

  const loadReviews = async () => {
    try {
      console.log('[CenterDetails] Starting to load reviews for center:', params.id);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`http://localhost:3001/api/reviews/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('[CenterDetails] Failed to fetch reviews:', response.status, response.statusText);
        const text = await response.text();
        console.error('[CenterDetails] Error response:', text);
        throw new Error('Failed to fetch reviews');
      }

      await response.json();
      console.log('[CenterDetails] Reviews loaded successfully');
    } catch (error) {
      console.error('[CenterDetails] Failed to load reviews:', error);
    }
  };

  useEffect(() => {
    loadCenter();
    loadChildren();
    loadReviews();
  }, [params.id]);

  const loadCenter = async () => {
    try {
      const data = await getCenter(params.id as string);
      setCenter(data);
    } catch (error) {
      console.error('Failed to load center:', error);
      toast.error('Failed to load care center details');
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async () => {
    try {
      console.log('[loadChildren] Starting to load children');
      const data = await getChildren();
      console.log('[loadChildren] Children data received:', {
        count: data.length,
        childrenIds: data.map(child => child.id)
      });

      // Filter out children without valid IDs
      const validChildren = data.filter(hasValidId);
      console.log('[loadChildren] Valid children:', {
        total: data.length,
        valid: validChildren.length,
        validIds: validChildren.map(child => child.id)
      });

      if (validChildren.length === 0) {
        console.log('[loadChildren] No valid children found');
        toast.error('No children found. Please add a child first.');
      }

      setChildren(validChildren);

      // Reset selected child if it's no longer valid
      if (selectedChild && !validChildren.some(child => child.id === selectedChild)) {
        console.log('[loadChildren] Selected child no longer valid, resetting selection');
        setSelectedChild('');
        toast.warning('Previously selected child is no longer available');
      }
    } catch (error) {
      console.error('[loadChildren] Failed to load children:', error);
      toast.error('Failed to load children. Please try again.');
    }
  };

  const handleBook = async () => {
    if (booking) return; // Prevent double submission
    
    try {
      setBooking(true);
      
      // Validate center
      if (!center?.id) {
        toast.error('Care center information not available');
        return;
      }
      
      // Validate child selection
      if (!selectedChild) {
        toast.error('Please select a child');
        return;
      }

      // Validate child exists in our list
      const selectedChildData = children.find(child => child.id === selectedChild);
      if (!selectedChildData) {
        toast.error('Selected child is no longer available. Please select another child.');
        setSelectedChild('');
        await loadChildren(); // Refresh children list
        return;
      }

      // Validate date and time
      if (!selectedDate || !selectedTime) {
        toast.error('Please select a date and time');
        return;
      }

      // Validate date is not in the past
      const now = new Date();
      if (selectedDate < now) {
        toast.error('Please select a future date');
        setSelectedDate(undefined);
        return;
      }

      // Prepare booking dates
      const [hours, minutes] = selectedTime.split(':');
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes));
      
      // Validate time is not in the past
      if (bookingDate < now) {
        toast.error('Please select a future time slot');
        setSelectedTime('');
        return;
      }

      const endDate = addHours(bookingDate, 1);

      // Log booking attempt
      console.log('[handleBook] Attempting booking:', {
        centerId: center.id,
        centerName: center.name,
        child: selectedChildData.name,
        childId: selectedChild,
        date: format(bookingDate, 'PPP'),
        time: selectedTime
      });

      // Attempt booking
      const booking = await bookCenter(center.id, {
        childId: selectedChild,
        startDate: bookingDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Verify booking was created
      if (!booking?.id) {
        throw new Error('Booking was not created properly');
      }

      // Success
      console.log('[handleBook] Booking successful:', booking);
      toast.success('Successfully booked care center');
      router.push('/bookings');
    } catch (error: any) {
      console.error('[handleBook] Booking failed:', error);

      // Handle specific error messages
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('child not found') || errorMessage.includes('selected child not found')) {
        toast.error('The selected child was not found. Please refresh and try again.');
        await loadChildren(); // Refresh children list
        setSelectedChild(''); // Reset selection
      }
      else if (errorMessage.includes('not authorized') || errorMessage.includes('unauthorized')) {
        toast.error('You are not authorized to book for this child.');
        setSelectedChild('');
      }
      else if (errorMessage.includes('center not found')) {
        toast.error('This care center is no longer available.');
        router.push('/centers');
      }
      else if (errorMessage.includes('cannot connect') || errorMessage.includes('network error')) {
        toast.error('Unable to connect to the server. Please check your internet connection.');
      }
      else if (errorMessage.includes('not authenticated')) {
        toast.error('Your session has expired. Please log in again.');
        router.push('/login');
      }
      else if (errorMessage.includes('invalid response') || errorMessage.includes('invalid booking')) {
        toast.error('There was a problem processing your booking. Please try again.');
      }
      else {
        toast.error('Failed to book care center. Please try again.');
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!center) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{center.name}</h1>
        <Button variant="outline" onClick={() => router.push('/centers')}>
          Back to Centers
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Center Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">Address:</div>
              <div className="text-muted-foreground">{center.address}</div>
            </div>
            
            <div>
              <div className="font-medium">Rating:</div>
              <div className="text-muted-foreground">{center.rating}/5</div>
            </div>

            <div>
              <div className="font-medium">Hours:</div>
              <div className="text-muted-foreground">{center.openingHours}</div>
            </div>

            <div>
              <div className="font-medium">Description:</div>
              <div className="text-muted-foreground">{center.description}</div>
            </div>

            <div>
              <div className="font-medium">Capacity:</div>
              <div className="text-muted-foreground">{center.capacity} children</div>
            </div>

            {center.ageRange && (
              <div>
                <div className="font-medium">Age Range:</div>
                <div className="text-muted-foreground">
                  {center.ageRange?.Min || "?"} - {center.ageRange?.Max || "?"} years
                </div>
              </div>
            )}

            <div>
              <div className="font-medium">Fees:</div>
              <div className="text-muted-foreground space-y-1">
                <div>Hourly: ${center.fees?.hourly}</div>
                <div>Daily: ${center.fees?.daily}</div>
                <div>Monthly: ${center.fees?.monthly}</div>
              </div>
            </div>

            <div>
              <ReviewSection centreId={params.id as string} onReviewSubmitted={loadReviews} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Book a Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">Select Child</div>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Select Date</div>
              <Card className="border-0 shadow-none">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: today }}
                  className="p-0"
                />
              </Card>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Select Time</div>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleBook} 
              disabled={booking || !selectedChild || !selectedDate || !selectedTime}
            >
              {booking ? 'Booking...' : 'Book Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 