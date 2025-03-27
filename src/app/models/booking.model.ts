// export interface Booking {
//      booking_id: string;
//      pickup_location: string;
//      dropoff_location: string;
//      pickup_datetime: string;
//      estimated_dropoff_datetime: Date;
//      booking_status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
//      ride_type: 'AIRPORT_PICKUP' | 'AIRPORT_DROPOFF' | 'ROUND_TRIP';
//      total_price: number;
//      payment_status: 'PENDING' | 'PAID' | 'FAILED';
//    }
   // src/app/models/booking.interface.ts
export interface Booking {
  booking_id: string;
  customer_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  booking_status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  ride_type: 'AIRPORT_PICKUP' | 'AIRPORT_DROPOFF' | 'ROUND_TRIP' | 'CITY_TO_CITY' | 'INTRA_CITY';
  total_distance: number;
  total_price: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  estimatedDuration: string;
  vehicleType: string;
  passengers: number;
  luggage: number;
  currency: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
}

// src/app/models/driver.interface.ts
export interface Driver {
  driver_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  is_available: boolean;
  vehicle?: Vehicle;
  distance?: number;
}

// src/app/models/vehicle.interface.ts
export interface Vehicle {
  vehicle_id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: 'SEDAN' | 'SUV' | 'LUXURY' | 'MINIVAN';
  passenger_capacity: number;
  is_active: boolean;
}

// src/app/models/pickup-point.interface.ts
export interface PickupPoint {
  pickup_point_id: string;
  booking_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  latitude: number;
  longitude: number;
  distance_from_start: number;
  percent_of_total_distance: number;
  price_percentage: number;
  price_amount: number;
  pickup_status: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'CANCELLED';
  pickup_time?: string;
}

// src/app/models/payment.interface.ts
export interface Payment {
  payment_id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: 'CASH' | 'CARD' | 'SUBSCRIPTION';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transaction_id?: string;
  card_last_four?: string;
  subscription_id?: string;
  payment_date: string;
}