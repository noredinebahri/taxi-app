import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BookingService } from '../../services/booking.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-details.component.html',
  styleUrls: ['./price-details.component.scss'],
})
export class PriceDetailsComponent implements OnInit {
  stripe: Stripe | null = null;
  currencies: string[] = [
    "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", 
    "HKD", "HRK", "HUF", "IDR",  "INR", "ISK", "JPY", "KRW", "MXN", 
    "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", 
    "TRY", "USD", "ZAR"
];; // Liste des devises
isDropdownOpen: boolean = false;
toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

selectCurrency(code: string) {
  this.selectedCurrency = code;
  this.isDropdownOpen = false;
  // this.convertCurrency()
}

getFlag(code: string): string {
  const currency = this.currenciesWithFlags.find(c => c.code === code);
  return currency ? currency.flag : '';
}
currenciesWithFlags: { code: string, flag: string }[] = [
  { code: "AUD", flag: "https://flagcdn.com/w40/au.png" },
  { code: "BGN", flag: "https://flagcdn.com/w40/bg.png" },
  { code: "BRL", flag: "https://flagcdn.com/w40/br.png" },
  { code: "CAD", flag: "https://flagcdn.com/w40/ca.png" },
  { code: "CHF", flag: "https://flagcdn.com/w40/ch.png" },
  { code: "CNY", flag: "https://flagcdn.com/w40/cn.png" },
  { code: "CZK", flag: "https://flagcdn.com/w40/cz.png" },
  { code: "DKK", flag: "https://flagcdn.com/w40/dk.png" },
  { code: "EUR", flag: "https://flagcdn.com/w40/eu.png" },
  { code: "GBP", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "HKD", flag: "https://flagcdn.com/w40/hk.png" },
  { code: "HRK", flag: "https://flagcdn.com/w40/hr.png" },
  { code: "HUF", flag: "https://flagcdn.com/w40/hu.png" },
  { code: "IDR", flag: "https://flagcdn.com/w40/id.png" },
  { code: "INR", flag: "https://flagcdn.com/w40/in.png" },
  { code: "ISK", flag: "https://flagcdn.com/w40/is.png" },
  { code: "JPY", flag: "https://flagcdn.com/w40/jp.png" },
  { code: "KRW", flag: "https://flagcdn.com/w40/kr.png" },
  { code: "MXN", flag: "https://flagcdn.com/w40/mx.png" },
  { code: "MYR", flag: "https://flagcdn.com/w40/my.png" },
  { code: "NOK", flag: "https://flagcdn.com/w40/no.png" },
  { code: "NZD", flag: "https://flagcdn.com/w40/nz.png" },
  { code: "PHP", flag: "https://flagcdn.com/w40/ph.png" },
  { code: "PLN", flag: "https://flagcdn.com/w40/pl.png" },
  { code: "RON", flag: "https://flagcdn.com/w40/ro.png" },
  { code: "RUB", flag: "https://flagcdn.com/w40/ru.png" },
  { code: "SEK", flag: "https://flagcdn.com/w40/se.png" },
  { code: "SGD", flag: "https://flagcdn.com/w40/sg.png" },
  { code: "THB", flag: "https://flagcdn.com/w40/th.png" },
  { code: "TRY", flag: "https://flagcdn.com/w40/tr.png" },
  { code: "USD", flag: "https://flagcdn.com/w40/us.png" },
  { code: "ZAR", flag: "https://flagcdn.com/w40/za.png" }
];
  amount: number = 0; // Montant à convertir
  selectedCurrency: string = 'USD'; // Devise sélectionnée
  baseCurrency: string = 'USD'; // Devise de base
  convertedAmount: number = 0; // Montant converti
  apiStrips: string = 'http://localhost:3000/api/v1/booking/create-checkout-session';
  tokenStrips: string = 'pk_test_51KYsoWLQSEoYz0V0mf90aQ2jVfS8fM1440I5xKpCmpnWONeV9SlAJJ6UosWLoHKCQVE6c8CkZNkuBcFEHKEQuQ7V00mXIy08HL';
  async createCheckoutSession(amount: number, description: string) {
    try {
      // Convertir en centimes pour Stripe (par exemple 10.50 EUR devient 1050)
      const amountInCents = Math.round(amount * 100);
      
      console.log('Envoi des données au serveur:', {
        amount: amountInCents, // En centimes
        currency: this.selectedCurrency,
        description
      });
      
      const response = await fetch(this.apiStrips, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents, // En centimes
          currency: this.selectedCurrency,
          description: description,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData);
      
      if (!responseData.sessionId) {
        console.error('Pas de sessionId dans la réponse:', responseData);
        throw new Error('Pas de sessionId dans la réponse');
      }
      
      // Redirection vers Stripe Checkout
      const stripe = await loadStripe(this.tokenStrips);
      if (!stripe) {
        throw new Error('Impossible de charger Stripe');
      }
      
      const result = await stripe.redirectToCheckout({ 
        sessionId: responseData.sessionId 
      });
      
      if (result.error) {
        console.error('Erreur Stripe:', result.error);
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      alert(`Erreur de paiement: ${error.message}`);
      throw error;
    }
  }
 
  // ...
  onCurrencyChange() {
    // this.convertCurrency(); // Appeler la conversion dès que l'utilisateur change la devise
  }
  currencyChanged: boolean = false;
  // convertCurrency() {
  //   this.bookingService.convertCurrency(this.price, this.baseCurrency, this.selectedCurrency).subscribe({
  //     next: (response:any) => {
  //       this.convertedAmount = response.currency;
  //       this.currencyChanged = true;
  //     },
  //     error: (err:any) => {
  //       console.error('Erreur de conversion de devise', err);
  //     }
  //   });
  // }

  currency: any;
 
  
  price: number = 0;
  distance: number = 0;
  isLoading: boolean = true;
  airportName: string = '';
  cityName: string = '';
  errorMessage: string = '';
  selectedCity: string = '';
  bookingId: string = '';
  cancelBooking(): void {
    if (confirm('Êtes-vous sûr d’annuler ?')) {
      // this.bookingService.cancelBooking(this.bookingId)
      //   .subscribe({
      //     next: () => alert('Réservation annulée.'),
      //     error: (err) => console.error('Erreur lors de l’annulation', err),
      //   });
    }
  }
  payWithStripe(): void {
    // this.stripeService.processPayment({ amount: this.price, currency: 'MAD' })
    //   .subscribe({
    //     next: () => alert('Paiement réussi !'),
    //     error: (err) => console.error('Erreur de paiement', err),
    //   });
  }
  constructor(private http: HttpClient, private router: Router, private bookingService: BookingService) {}

  async ngOnInit() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    this.stripe = await loadStripe('pk_test_51KYsoWLQSEoYz0V0mf90aQ2jVfS8fM1440I5xKpCmpnWONeV9SlAJJ6UosWLoHKCQVE6c8CkZNkuBcFEHKEQuQ7V00mXIy08HL');
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

  async confirmBooking() {
    try {
      const amount = this.currencyChanged ? this.convertedAmount : this.price;
      const description = `Trajet de ${this.airportName} à ${this.cityName}`;
      
      // Attendre que la redirection soit terminée
      await this.createCheckoutSession(amount, description);
      
      // Ces lignes ne seront exécutées que si la redirection échoue
      // car normalement, l'utilisateur sera redirigé vers Stripe
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe :', error);
      this.errorMessage = '❌ Une erreur est survenue lors de la redirection vers le paiement.';
    }
  }
}
