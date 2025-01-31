import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.scss']
})
export class ClientInfoComponent implements OnInit {
  clientForm!: FormGroup | any;
  fullBooking: any;

  constructor(private fb: FormBuilder, private bookingService: BookingService, private router: Router) {
   
  }
  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; 
      }
      const regex = /^\+?(\d{1,4})?[\s-]?(\(?\d{1,3}\)?[\s-]?)?[\d\s-]{7,10}$/;
      const isValid = regex.test(control.value);
      return isValid ? null : { 'invalidPhoneNumber': true };
    };
  }
  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(userData);
    
    this.clientForm = this.fb.group({
      fullName: [ '', Validators.required],
      phone: ['', [Validators.required, this.phoneNumberValidator()]],
      email: ['', [Validators.required, Validators.email]]
    });
    this.clientForm.patchValue({
      fullName: userData.last_name+' '+userData.first_name,
      phone: userData.phone,
      email: userData.email
    });
    const storedBooking = localStorage.getItem('bookingData');
    this.fullBooking = storedBooking ? JSON.parse(storedBooking) : {};
  }

  continueToPrice(): void {
    if (this.clientForm.valid) {
      const finalBooking = {
        ...this.fullBooking,
        ...this.clientForm.value
      };
      localStorage.setItem('bookingData', JSON.stringify(finalBooking));
      this.router.navigate(['/price-details']);
    }
  }
}
