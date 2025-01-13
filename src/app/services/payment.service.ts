import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  stripePromise = loadStripe('pk_test_51QgVDyJCrX3Iv671oeDk12ksRu6faaeMgwbzMBayIIUUUhzdIFq3PIOXJT55cDxMBfVm3SFl0PluA2Rl63QczUHg00oxFRDOVh');
  
  async pay(amount: number): Promise<void> {
    const stripe = await this.stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      lineItems: [{ price: 'price_1XXXXXXX', quantity: 1 }],
      mode: 'payment',
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/cancel',
    });
    if (error) console.error(error);
  }
}
