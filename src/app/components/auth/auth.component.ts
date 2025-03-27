import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  styleUrls: ['./auth.component.scss']
  
})
export class AuthComponent {
  selectedTab: number = 0; // Pour gérer les onglets
  hide = true;
  loginForm!: FormGroup;
  signupForm!: FormGroup | any;
  signupData = { first_name: '', last_name: '', email: '', password: '', currency: 'USD', language: 'en' };
  loginData = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {

    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });

    this.signupForm = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      currency: new FormControl('USD', [Validators.required]),
      language: new FormControl('en', [Validators.required])
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email,this.loginForm.value.password).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));  // Optionally store user data
          this.router.navigate(['/booking']);  // Redirect to booking or home page
        },
        error: (error) => {
        }
      });
    } else {
    }
  }

  signup() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: () => {
          this.selectedTab = 0; // Rediriger vers l'onglet login
        },
        error: (error) => {
        }
      });
    } else {
    }
  }
}
