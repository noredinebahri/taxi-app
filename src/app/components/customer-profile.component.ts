// src/app/components/customer/customer-profile.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking, Payment } from '../models/booking.model';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking.service';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h2>My Profile</h2>
      
      <div class="profile-section">
        <h3>Personal Information</h3>
        <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" id="full_name" formControlName="full_name">
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" formControlName="email">
          </div>
          
          <div class="form-group">
            <label for="phone_number">Phone Number</label>
            <input type="tel" id="phone_number" formControlName="phone_number">
          </div>
          
          <button type="submit" class="btn primary" [disabled]="profileForm.invalid || !profileForm.dirty">
            Update Profile
          </button>
        </form>
      </div>
      
      <div class="profile-section">
        <h3>Payment Methods</h3>
        <div class="payment-methods">
          <div class="payment-method" *ngFor="let method of paymentMethods">
            <div class="payment-method-info">
              <div class="payment-method-type">
                <i class="fas" [ngClass]="getPaymentIcon(method.type)"></i>
                <span>{{ method.type === 'CARD' ? 'Card' : 'Subscription' }}</span>
              </div>
              <div class="payment-method-details">
                {{ method.details }}
              </div>
            </div>
            <button class="btn remove-btn" (click)="removePaymentMethod(method.id)">
              Remove
            </button>
          </div>
          
          <div *ngIf="paymentMethods.length === 0" class="no-payment-methods">
            No payment methods added yet.
          </div>
          
          <button class="btn secondary add-btn" (click)="showAddPaymentForm = true" *ngIf="!showAddPaymentForm">
            Add Payment Method
          </button>
        </div>
        
        <form *ngIf="showAddPaymentForm" [formGroup]="paymentForm" (ngSubmit)="addPaymentMethod()" class="mt-20">
          <div class="form-group">
            <label for="payment_type">Payment Type</label>
            <select id="payment_type" formControlName="payment_type">
              <option value="CARD">Credit/Debit Card</option>
              <option value="SUBSCRIPTION">Subscription</option>
            </select>
          </div>
          
          <ng-container *ngIf="paymentForm.value.payment_type === 'CARD'">
            <div class="form-group">
              <label for="card_number">Card Number</label>
              <input type="text" id="card_number" formControlName="card_number" placeholder="XXXX XXXX XXXX XXXX">
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="expiry_date">Expiry Date</label>
                <input type="text" id="expiry_date" formControlName="expiry_date" placeholder="MM/YY">
              </div>
              
              <div class="form-group half">
                <label for="cvv">CVV</label>
                <input type="password" id="cvv" formControlName="cvv" placeholder="XXX">
              </div>
            </div>
            
            <div class="form-group">
              <label for="card_holder">Card Holder Name</label>
              <input type="text" id="card_holder" formControlName="card_holder">
            </div>
          </ng-container>
          
          <ng-container *ngIf="paymentForm.value.payment_type === 'SUBSCRIPTION'">
            <div class="form-group">
              <label for="subscription_code">Subscription Code</label>
              <input type="text" id="subscription_code" formControlName="subscription_code">
            </div>
          </ng-container>
          
          <div class="form-actions">
            <button type="button" class="btn secondary" (click)="showAddPaymentForm = false">
              Cancel
            </button>
            <button type="submit" class="btn primary" [disabled]="paymentForm.invalid">
              Add Payment Method
            </button>
          </div>
        </form>
      </div>
      
      <div class="profile-section">
        <h3>Booking History</h3>
        <div class="booking-history">
          <div class="booking-filters">
            <select [(ngModel)]="historyFilter" (change)="filterHistory()">
              <option value="ALL">All Bookings</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div class="booking-list">
            <div class="booking-item" *ngFor="let booking of filteredBookings">
              <div class="booking-header">
                <div class="booking-date">
                  {{ formatDate(booking.pickup_datetime) }}
                </div>
                <div class="booking-status" [ngClass]="getStatusClass(booking.booking_status)">
                  {{ booking.booking_status }}
                </div>
              </div>
              
              <div class="booking-details">
                <div class="booking-route">
                  <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ booking.pickup_location }}</span>
                  </div>
                  <div class="route-separator"></div>
                  <div class="route-point">
                    <i class="fas fa-flag-checkered"></i>
                    <span>{{ booking.dropoff_location }}</span>
                  </div>
                </div>
                
                <div class="booking-info">
                  <div class="info-item">
                    <i class="fas fa-car"></i>
                    <span>{{ booking.vehicleType }}</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-route"></i>
                    <span>{{ booking.total_distance }} km</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>{{ booking.total_price }} {{ booking.currency }}</span>
                  </div>
                  <div class="info-item" [ngClass]="getPaymentStatusClass(booking.payment_status)">
                    <i class="fas fa-credit-card"></i>
                    <span>{{ booking.payment_status }}</span>
                  </div>
                </div>
              </div>
              
              <div class="booking-actions" *ngIf="canRebook(booking)">
                <button class="btn primary" (click)="rebookTrip(booking)">
                  Book Similar Trip
                </button>
              </div>
            </div>
            
            <div *ngIf="filteredBookings.length === 0" class="no-bookings">
              No booking history found.
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>Payment History</h3>
        <div class="payment-history">
          <div class="payment-list">
            <div class="payment-item" *ngFor="let payment of paymentHistory">
              <div class="payment-header">
                <div class="payment-date">
                  {{ formatDate(payment.payment_date) }}
                </div>
                <div class="payment-status" [ngClass]="getPaymentStatusClass(payment.payment_status)">
                  {{ payment.payment_status }}
                </div>
              </div>
              
              <div class="payment-details">
                <div class="payment-method-info">
                  <i class="fas" [ngClass]="getPaymentIcon(payment.payment_method)"></i>
                  <span>{{ getPaymentMethodName(payment.payment_method) }}</span>
                  <span *ngIf="payment.card_last_four">•••• {{ payment.card_last_four }}</span>
                </div>
                <div class="payment-amount">
                  {{ payment.amount }} {{ payment.currency }}
                </div>
              </div>
            </div>
            
            <div *ngIf="paymentHistory.length === 0" class="no-payments">
              No payment history found.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .profile-section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .half {
      flex: 1;
    }
    
    .mt-20 {
      margin-top: 20px;
    }
    
    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .primary {
      background-color: #0066CC;
      color: white;
    }
    
    .secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .remove-btn {
      background-color: #dc3545;
      color: white;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    /* Payment Methods Styles */
    .payment-methods {
      margin-top: 10px;
    }
    
    .payment-method {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: white;
      border-radius: 4px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .payment-method-type {
      display: flex;
      align-items: center;
      font-weight: 500;
    }
    
    .payment-method-type i {
      margin-right: 10px;
      font-size: 18px;
    }
    
    .payment-method-details {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .no-payment-methods {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
    
    .add-btn {
      margin-top: 10px;
      width: 100%;
    }
    
    /* Booking History Styles */
    .booking-filters {
      margin-bottom: 15px;
    }
    
    .booking-filters select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 200px;
    }
    
    .booking-list {
      margin-top: 10px;
    }
    
    .booking-item {
      background-color: white;
      border-radius: 4px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f2f2f2;
    }
    
    .booking-date {
      font-weight: 500;
    }
    
    .booking-status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-pending {
      background-color: #ffeeba;
      color: #856404;
    }
    
    .status-confirmed {
      background-color: #b8daff;
      color: #004085;
    }
    
    .status-in-progress {
      background-color: #c3e6cb;
      color: #155724;
    }
    
    .status-completed {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-cancelled {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .booking-details {
      padding: 15px;
    }
    
    .booking-route {
      margin-bottom: 15px;
    }
    
    .route-point {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .route-point i {
      margin-right: 10px;
      color: #666;
    }
    
    .route-separator {
      width: 2px;
      height: 20px;
      background-color: #ddd;
      margin-left: 9px;
      margin-bottom: 5px;
    }
    
    .booking-info {
      display: flex;
      flex-wrap: wrap;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      margin-right: 20px;
      margin-bottom: 5px;
    }
    
    .info-item i {
      margin-right: 5px;
      color: #666;
    }
    
    .booking-actions {
      padding: 0 15px 15px;
      text-align: right;
    }
    
    .no-bookings {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
    
    /* Payment History Styles */
    .payment-item {
      background-color: white;
      border-radius: 4px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f2f2f2;
    }
    
    .payment-date {
      font-weight: 500;
    }
    
    .payment-status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-pending {
      background-color: #ffeeba;
      color: #856404;
    }
    
    .status-completed {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .payment-details {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .payment-method-info {
      display: flex;
      align-items: center;
    }
    
    .payment-method-info i {
      margin-right: 10px;
      font-size: 18px;
    }
    
    .payment-method-info span {
      margin-right: 10px;
    }
    
    .payment-amount {
      font-weight: 500;
      font-size: 16px;
    }
    
    .no-payments {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
  `]
})
export class CustomerProfileComponent implements OnInit {
  profileForm: FormGroup;
  paymentForm: FormGroup;
  
  showAddPaymentForm = false;
  paymentMethods: any[] = [];
  bookingHistory: Booking[] = [];
  filteredBookings: Booking[] = [];
  paymentHistory: Payment[] = [];
  historyFilter = 'ALL';
  
  constructor(
    private fb: FormBuilder,
    @Inject('AuthService') private authService: AuthService,
    @Inject('BookingService') private bookingService: BookingService,
    @Inject('PaymentService') private paymentService: PaymentService,
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required]
    });
    
    this.paymentForm = this.fb.group({
      payment_type: ['CARD', Validators.required],
      card_number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiry_date: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      card_holder: ['', Validators.required],
      subscription_code: ['']
    });
    
    // Set conditional validators
    this.paymentForm.get('payment_type')?.valueChanges.subscribe(type => {
      if (type === 'CARD') {
        this.paymentForm.get('card_number')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
        this.paymentForm.get('expiry_date')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        this.paymentForm.get('card_holder')?.setValidators([Validators.required]);
        this.paymentForm.get('subscription_code')?.clearValidators();
      } else {
        this.paymentForm.get('card_number')?.clearValidators();
        this.paymentForm.get('expiry_date')?.clearValidators();
        this.paymentForm.get('cvv')?.clearValidators();
        this.paymentForm.get('card_holder')?.clearValidators();
        this.paymentForm.get('subscription_code')?.setValidators([Validators.required]);
      }
      
      // Update validity
      this.paymentForm.get('card_number')?.updateValueAndValidity();
      this.paymentForm.get('expiry_date')?.updateValueAndValidity();
      this.paymentForm.get('cvv')?.updateValueAndValidity();
      this.paymentForm.get('card_holder')?.updateValueAndValidity();
      this.paymentForm.get('subscription_code')?.updateValueAndValidity();
    });
  }
  
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadPaymentMethods();
    this.loadBookingHistory();
    this.loadPaymentHistory();
  }
  
  loadUserProfile(): void {
    // In a real app, you would load customer profile from the backend
    // Using the authService.currentUser as a placeholder
    this.authService.currentUser.subscribe((user: any) => {
      if (user) {
        this.profileForm.patchValue({
          full_name: user.full_name || '',
          email: user.email || '',
          phone_number: user.phone_number || ''
        });
      }
    });
  }
  
  loadPaymentMethods(): void {
    // Sample data - in a real app, you would fetch this from the backend
    this.paymentMethods = [
      {
        id: 'pm1',
        type: 'CARD',
        details: 'Visa ending in 4242'
      },
      {
        id: 'pm2',
        type: 'SUBSCRIPTION',
        details: 'Monthly Subscription'
      }
    ];
  }
  
  loadBookingHistory(): void {
    this.bookingService.getUserBookings().subscribe(
      (response: any) => {
        this.bookingHistory = response.bookings || [];
        this.filterHistory();
      },
      (error: any) => {
        console.error('Error loading booking history', error);
      }
    );
  }
  
  loadPaymentHistory(): void {
    this.paymentService.getPaymentHistory().subscribe(
      (response: any) => {
        this.paymentHistory = response.payments || [];
      },
      (error: any) => {
        console.error('Error loading payment history', error);
      }
    );
  }
  
  updateProfile(): void {
    // In a real app, you would send the updated profile to the backend
    console.log('Update profile with:', this.profileForm.value);
    
    // Mock successful update
    alert('Profile updated successfully!');
    this.profileForm.markAsPristine();
  }
  
  addPaymentMethod(): void {
    // In a real app, you would send the payment method data to the backend
    console.log('Add payment method with:', this.paymentForm.value);
    
    // Mock successful add
    if (this.paymentForm.value.payment_type === 'CARD') {
      const cardNumber = this.paymentForm.value.card_number;
      const lastFour = cardNumber.substring(cardNumber.length - 4);
      
      this.paymentMethods.push({
        id: 'pm' + (this.paymentMethods.length + 1),
        type: 'CARD',
        details: `Card ending in ${lastFour}`
      });
    } else {
      this.paymentMethods.push({
        id: 'pm' + (this.paymentMethods.length + 1),
        type: 'SUBSCRIPTION',
        details: 'Subscription Code: ' + this.paymentForm.value.subscription_code
      });
    }
    
    this.paymentForm.reset({ payment_type: 'CARD' });
    this.showAddPaymentForm = false;
  }
  
  removePaymentMethod(id: string): void {
    // In a real app, you would send a request to remove the payment method
    this.paymentMethods = this.paymentMethods.filter(method => method.id !== id);
  }
  
  filterHistory(): void {
    if (this.historyFilter === 'ALL') {
      this.filteredBookings = [...this.bookingHistory];
    } else {
      this.filteredBookings = this.bookingHistory.filter(
        booking => booking.booking_status === this.historyFilter
      );
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }
  
  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PAID':
      case 'COMPLETED': return 'status-completed';
      case 'FAILED': return 'status-failed';
      default: return '';
    }
  }
  
  getPaymentIcon(method: string): string {
    switch (method) {
      case 'CARD': return 'fa-credit-card';
      case 'CASH': return 'fa-money-bill-wave';
      case 'SUBSCRIPTION': return 'fa-calendar-alt';
      default: return 'fa-credit-card';
    }
  }
  
  getPaymentMethodName(method: string): string {
    switch (method) {
      case 'CARD': return 'Card';
      case 'CASH': return 'Cash';
      case 'SUBSCRIPTION': return 'Subscription';
      default: return method;
    }
  }
  
  canRebook(booking: Booking): boolean {
    return booking.booking_status === 'COMPLETED' || booking.booking_status === 'CANCELLED';
  }
  
  rebookTrip(booking: Booking): void {
    // In a real app, you would pre-fill the booking form with this trip's details
    console.log('Rebook trip:', booking);
    
    // Navigate to booking page with prefilled data
    // This would be implemented with router in a real app
  }
}