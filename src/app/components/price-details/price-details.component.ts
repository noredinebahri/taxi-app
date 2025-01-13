import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-details.component.html',
  styleUrls: ['./price-details.component.scss'],
})
export class PriceDetailsComponent implements OnInit {
  price: number = 0;
  distance: number = 0;
  isLoading: boolean = true;
  airportName: string = '';
  cityName: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');

    // Vérifier si les données sont complètes
    if (!bookingData.airport || !bookingData.city) {
      this.errorMessage = '🚨 Information de réservation incomplètes.';
      this.isLoading = false;
      return;
    }

    this.airportName = bookingData.airportName;
    this.cityName = bookingData.cityName;

    // Requête API pour calculer le prix
    this.http.post<any>('http://localhost:3000/api/v1/booking/calculate', {
      airportId: bookingData.airport,
      cityId: bookingData.city,
      passengers: bookingData.passengers,
      luggage: bookingData.luggage
    }).subscribe({
      next: (response) => {
        this.price = response.price;
        this.distance = response.distance;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du calcul du prix :', error);
        this.errorMessage = '❌ Une erreur est survenue lors du calcul du prix.';
        this.isLoading = false;
      }
    });
  }

  confirmBooking(): void {
    alert(`🚖 Réservation confirmée au prix de ${this.price} MAD !`);
    localStorage.removeItem('bookingData');
    this.router.navigate(['/']);
  }

  cancelBooking(): void {
    alert('❌ Réservation annulée');
    this.router.navigate(['/']);
  }
}
