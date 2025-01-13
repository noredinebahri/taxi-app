import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${API_CONFIG.baseUrl}/auth`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.tokenService.saveToken(response.token);
      })
    );
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }
}
