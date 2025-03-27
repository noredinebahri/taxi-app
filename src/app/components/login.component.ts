// src/app/components/auth/login.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="Enter your email"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']">
              Email is required
            </div>
            <div class="error-message" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['email']">
              Please enter a valid email
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="Enter your password"
            >
            <div class="error-message" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']">
              Password is required
            </div>
          </div>
          
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn primary" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        
          // ...

          <p>Don't have an account? <a [routerLink]="['/signup']">Sign up</a></p>
        </div>
      </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 30px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      color: #333;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn {
      display: block;
      width: 100%;
      padding: 12px;
      margin-top: 24px;
      border: none;
      border-radius: 4px;
      background-color: #0066CC;
      color: white;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .auth-footer {
      margin-top: 24px;
      text-align: center;
    }
    
    .auth-footer a {
      color: #0066CC;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  login(): void {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Redirect based on user type
        if (this.authService.isDriver) {
          this.router.navigate(['/driver/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}