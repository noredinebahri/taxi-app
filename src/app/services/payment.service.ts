// import { Injectable } from '@angular/core';
// import { loadStripe, Stripe } from '@stripe/stripe-js';

// @Injectable({
//   providedIn: 'root'
// })
// export class PaymentService {
//   stripePromise = loadStripe('pk_test_51QgVDyJCrX3Iv671oeDk12ksRu6faaeMgwbzMBayIIUUUhzdIFq3PIOXJT55cDxMBfVm3SFl0PluA2Rl63QczUHg00oxFRDOVh');
  
//   async pay(amount: number): Promise<void> {
//     const stripe = await this.stripePromise;
//     const { error } = await stripe!.redirectToCheckout({
//       lineItems: [{ price: 'price_1XXXXXXX', quantity: 1 }],
//       mode: 'payment',
//       successUrl: window.location.origin + '/success',
//       cancelUrl: window.location.origin + '/cancel',
//     });
//     if (error) console.error(error);
//   }
// }

// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  createCashPayment(bookingId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/cash/${bookingId}`, {});
  }

  createCardPayment(bookingId: string, cardData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/card/${bookingId}`, cardData);
  }

  createSubscriptionPayment(bookingId: string, subscriptionId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/subscription/${bookingId}`, { subscription_id: subscriptionId });
  }

  completeRide(bookingId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/booking/complete/${bookingId}`, {});
  }

  getPaymentHistory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/booking/history`);
  }
}