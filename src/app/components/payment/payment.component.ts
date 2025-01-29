import { Component } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  stripe: Stripe | null = null;

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51KYsoWLQSEoYz0V0mf90aQ2jVfS8fM1440I5xKpCmpnWONeV9SlAJJ6UosWLoHKCQVE6c8CkZNkuBcFEHKEQuQ7V00mXIy08HL');
  }

    async createCheckoutSession(amount: number, description: string) {
      // get data from localstorage
      const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
      const response = await fetch('http://localhost:3000/api/v1/booking/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          description: description,
          city: bookingData.city,
          email: bookingData.email,
          phone: bookingData.phone,
          fullName: bookingData.passengers,
          airport: bookingData.airport
        }),
      });
      const { sessionId } = await response.json();

      // Redirection vers Stripe Checkout
      const stripe = await loadStripe('pk_test_51KYsoWLQSEoYz0V0mf90aQ2jVfS8fM1440I5xKpCmpnWONeV9SlAJJ6UosWLoHKCQVE6c8CkZNkuBcFEHKEQuQ7V00mXIy08HL');
      stripe?.redirectToCheckout({ sessionId });
    }
}
