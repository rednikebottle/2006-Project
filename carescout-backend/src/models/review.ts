import { Guardian } from './guardian';
import { ChildcareCenter } from './childcare-center';

export interface Review {
    id: string;
    guardian: Guardian;
    center: ChildcareCenter;
    rating: number;
    comment: string;
    timestamp: Date;
    submitReview(): boolean;
}
  