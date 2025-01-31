import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_CONFIG.baseUrl}/auth`;
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly BOOKING_DATA_KEY = 'bookingData';

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router) { }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(loginData: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  getTockenFromUrl(): string | null {
    return this.activatedRoute.snapshot.paramMap.get(this.TOKEN_KEY);
  }
  verifyToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}`);
  }

  logout() {
   
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.BOOKING_DATA_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth']);
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

}
