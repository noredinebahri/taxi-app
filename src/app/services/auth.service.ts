// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { API_CONFIG } from '../config/api.config';
// import { ActivatedRoute, Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = `${API_CONFIG.baseUrl}/auth`;
//   private readonly TOKEN_KEY = 'token';
//   private readonly USER_KEY = 'user';
//   private readonly BOOKING_DATA_KEY = 'bookingData';

//   constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router) { }

//   signup(userData: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}/signup`, userData);
//   }

//   login(loginData: any) {
//     return this.http.post<any>(`${this.apiUrl}/login`, loginData);
//   }

//   saveToken(token: string) {
//     localStorage.setItem(this.TOKEN_KEY, token);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.TOKEN_KEY);
//   }
//   getTockenFromUrl(): string | null {
//     return this.activatedRoute.snapshot.paramMap.get(this.TOKEN_KEY);
//   }
//   verifyToken(token: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/verify-email/${token}`);
//   }

//   logout() {
   
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.BOOKING_DATA_KEY);
//     localStorage.removeItem(this.USER_KEY);
//     this.router.navigate(['/auth']);
//   }
//   isLoggedIn(): boolean {
//     return !!localStorage.getItem(this.TOKEN_KEY);
//   }

// }
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private baseUrl = 'http://localhost:3000/api/v1/';

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  signup(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/signup`, userData);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get isDriver(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'DRIVER';
  }

  get isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'CUSTOMER';
  }
}
