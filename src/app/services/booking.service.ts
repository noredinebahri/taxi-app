import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${API_CONFIG.baseUrl}/booking`;

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rides`);
  }

  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ride`, data);
  }
  getAirports(): Observable<any> {
    return this.http.get(`${this.apiUrl}/airports`);
  }

  getCitiesByAirport(airportId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cities/${airportId}`);
  }
  getCities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cities`);
  }
  getPlacesByCity(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/places/${city}`);
  }
  
  calculateFromTo(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calculateRideFromTo`, payload);
  }
  
}
