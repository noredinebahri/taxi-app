import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly TOKEN_KEY = 'token';
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): MaybeAsync<GuardResult> {
    if (localStorage.getItem(this.TOKEN_KEY)) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
