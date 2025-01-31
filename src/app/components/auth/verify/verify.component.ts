import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent implements OnDestroy {
  token: string = '';
  message: string = '';
  isLoading: boolean = false; // To handle loading state
  private destroy$ = new Subject<void>();

  
  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private router: Router) {
   
  }
  redirectToLogin() {
    this.router.navigate(['/auth']);
  }
  ngOnInit() {
    this.token = this.activatedRoute.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.verifyToken();
    } else {
      this.message = 'Invalid verification link.';
    }
  }

  verifyToken() {
    this.isLoading = true;
    this.authService.verifyToken(this.token).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        if (res.already === true && res.verify === true) {
          this.message = res.message;
          return
        }else if(res.already === true && res.verify === false){
          this.message = res.message;
          return
        } else {
          this.message = res.message;
          return
        }
      },
      error: (error) => {
        this.message = error.error.message || 'Verification failed. Please try again or contact support.';
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
