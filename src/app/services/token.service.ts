import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'auth_token';

  // Enregistrer le token
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Supprimer le token (Déconnexion)
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
