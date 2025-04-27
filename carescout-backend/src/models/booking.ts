import { Guardian } from './guardian';
import { Child } from './child';
import { ChildcareCenter } from './childcare-center';

export interface Booking {
    id: string;
    bookingID: string;
    guardian: Guardian;
    child: Child;
    childcareCenter: ChildcareCenter;
    status: string;
    bookingDate: Date;
    updateBookingStatus(status: string): Promise<boolean>;
}
  