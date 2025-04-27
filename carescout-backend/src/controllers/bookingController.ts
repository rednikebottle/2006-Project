import { db } from '../config/firebase';
import { Booking } from '../models/booking';

export const createBooking = async (bookingData: Booking) => {
  const bookingRef = await db.collection('bookings').add(bookingData);
  return bookingRef.id;
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  await db.collection('bookings').doc(bookingId).update({ status });
};
