import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatCardModule, CommonModule],
  providers: [MatSnackBar],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  bookingForm: FormGroup;

  airports: any[] = [];
  cities: string[] = [];
  places: string[] = [];

  constructor(private fb: FormBuilder, private bookingService: BookingService, private router: Router) {
    this.bookingForm = this.fb.group({
      airport: ['', Validators.required],
      city: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAirports();
    this.loadPlacesByCity()
  }

  loadAirports(): void {
    this.bookingService.getAirports().subscribe({
      next: (data: any) => this.airports = data,
      error: (err: any) => console.error('Erreur de chargement des aéroports', err)
    });
  }
  citiesMorocco: any;
  loadPlacesByCity(): void {
    this.bookingService.getCities().subscribe({
      next: (data: any) => this.citiesMorocco = data,
      error: (err: any) => console.error('Erreur de chargement des aéroports', err)
    });
  }
  onAirportChange(event: any): void {
    const airportId = event.target.value;
   
  }

  onCityChange(event: any): void {
    const city = event.target.value;
   
  }

  submitBooking(): void {
    console.log("dddddddd");
    
    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value;
      
      // Sauvegarder temporairement les données
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
  
      // Redirection vers la page des détails
      this.router.navigate(['/trip-details']);
  }
}
}
