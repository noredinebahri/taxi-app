// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, tap } from 'rxjs';
// import { Booking } from '../models/booking.model';
// import { API_CONFIG } from '../config/api.config';

// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {
//   private apiUrl = `${API_CONFIG.baseUrl}/booking`;

//   constructor(private http: HttpClient) {}

//   getAllBookings(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/rides`);
//   }
//   convertCurrency(amount: number, from: string, to: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/convertCurrency`, { amount, fromCurrency: from, toCurrency: to });
//   }
  
//   createBooking(data: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}/ride`, data);
//   }
//   getAirports(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/airports`).pipe(tap(d => console.log(d)));
//   }

//   getCitiesByAirport(airportId: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/cities/${airportId}`);
//   }
//   getCities(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/cities`);
//   }
//   getPlacesByCity(city: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/places/${city}`);
//   }
  
//   calculateFromTo(payload: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}/calculateRideFromTo`, payload);
//   }
  
// }


// src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/generateBooking`, bookingData);
  }

  getUserBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/taxi/bookings`);
  }

  getBookingById(bookingId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/taxi/booking/${bookingId}`);
  }

  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/taxi/booking/${bookingId}/status`, { status });
  }

  addPickupPoint(bookingId: string, pickupData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/${bookingId}`, pickupData);
  }
  getAirports(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/airports`);
  }

  getCities(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/cities`);
  }
  getPickupPoints(bookingId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/booking/${bookingId}`);
  }

  updatePickupStatus(bookingId: string, pickupPointId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/booking/${bookingId}/${pickupPointId}`, { pickup_status: status });
  }

  estimateFare(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<any>(`${this.baseUrl}/taxi/estimate`, { params: httpParams });
  }
}
