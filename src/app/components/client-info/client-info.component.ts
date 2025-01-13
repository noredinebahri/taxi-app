import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-info',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.scss']
})
export class ClientInfoComponent implements OnInit {
  clientForm: FormGroup;
  fullBooking: any;

  constructor(private fb: FormBuilder, private bookingService: BookingService, private router: Router) {
    this.clientForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
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

     
      localStorage.setItem('bookingData', JSON.stringify(finalBooking));
      this.router.navigate(['/price-details']);
    }
  }
}
