import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss']
})
export class TripDetailsComponent implements OnInit {
  detailsForm: FormGroup;
  bookingData: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.detailsForm = this.fb.group({
      passengers: ['', Validators.required],
      luggage: ['', Validators.required],
      tripNumber: ['']
    });
  }

  ngOnInit(): void {
    const storedBookingData = localStorage.getItem('bookingData');
    this.bookingData = storedBookingData ? JSON.parse(storedBookingData) : null;
  }

  continueBooking(): void {
    if (this.detailsForm.valid) {
      const fullBooking = {
        ...this.bookingData,
        ...this.detailsForm.value
      };

      // Stockage dans localStorage
      localStorage.setItem('bookingData', JSON.stringify(fullBooking));

      // Redirection vers la page des infos client
      this.router.navigate(['/client-info']);
    }
  }
}
