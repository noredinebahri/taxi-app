export interface Booking {
     booking_id: string;
     pickup_location: string;
     dropoff_location: string;
     pickup_datetime: Date;
     estimated_dropoff_datetime: Date;
     booking_status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
     ride_type: 'AIRPORT_PICKUP' | 'AIRPORT_DROPOFF' | 'ROUND_TRIP';
     total_price: number;
     payment_status: 'PENDING' | 'PAID' | 'FAILED';
   }
   