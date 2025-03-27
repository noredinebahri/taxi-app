

// src/app/services/driver.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  getAvailableDrivers(latitude: number, longitude: number, radius: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());
    
    return this.http.get<any>(`${this.baseUrl}/taxi/available-drivers`, { params });
  }

  rateDriver(ratingData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/taxi/rating`, ratingData);
  }

  setPricingRules(rules: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/pricing/rules`, { pricingRules: rules });
  }

  getPricingRules(driverId?: string): Observable<any> {
    let url = `${this.baseUrl}/booking/pricing/rules`;
    if (driverId) {
      url += `/${driverId}`;
    }
    return this.http.get<any>(url);
  }
}
