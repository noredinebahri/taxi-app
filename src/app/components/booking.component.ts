// src/app/components/booking/booking.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapComponent } from './map.component';
import { Driver, Booking, PickupPoint } from '../models/booking.model';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking.service';
import { DriverService } from '../services/driver.service';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MapComponent],
  template: `
    <div class="booking-container">
      <div class="map-section">
        <app-map
          [center]="mapCenter"
          [zoom]="mapZoom"
          [drivers]="nearbyDrivers"
          [booking]="currentBooking"
          [pickupPoints]="pickupPoints"
          (driverSelected)="onDriverSelected($event)"
          (mapClicked)="onMapClicked($event)"
        ></app-map>
      </div>
      
      <div class="booking-panel">
        <h2 class="panel-title">{{ currentBooking ? 'Current Booking' : 'Book a Taxi' }}</h2>
        
        <ng-container *ngIf="!currentBooking">
          <form [formGroup]="bookingForm" (ngSubmit)="createBooking()">
            <div class="form-group">
              <label for="pickup">Pickup Location</label>
              <input 
                type="text" 
                id="pickup" 
                formControlName="pickup_location" 
                placeholder="Enter pickup location"
              >
              <div class="coordinates" *ngIf="pickupCoords">
                Lat: {{ pickupCoords.lat.toFixed(6) }}, Lng: {{ pickupCoords.lng.toFixed(6) }}
              </div>
              <button type="button" class="btn btn-sm" (click)="setAsPickup()">Set current location as pickup</button>
            </div>
            
            <div class="form-group">
              <label for="dropoff">Dropoff Location</label>
              <input 
                type="text" 
                id="dropoff" 
                formControlName="dropoff_location" 
                placeholder="Enter dropoff location"
              >
              <div class="coordinates" *ngIf="dropoffCoords">
                Lat: {{ dropoffCoords.lat.toFixed(6) }}, Lng: {{ dropoffCoords.lng.toFixed(6) }}
              </div>
              <button type="button" class="btn btn-sm" (click)="setAsDropoff()">Set current location as dropoff</button>
            </div>
            
            <div class="form-group">
              <label for="datetime">Pickup Time</label>
              <input 
                type="datetime-local" 
                id="datetime" 
                formControlName="pickup_datetime"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="vehicle_type">Vehicle Type</label>
                <select id="vehicle_type" formControlName="vehicle_type">
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="LUXURY">Luxury</option>
                  <option value="MINIVAN">Minivan</option>
                </select>
              </div>
              
              <div class="form-group half">
                <label for="ride_type">Ride Type</label>
                <select id="ride_type" formControlName="ride_type">
                  <option value="CITY_TO_CITY">City to City</option>
                  <option value="INTRA_CITY">Within City</option>
                  <option value="AIRPORT_PICKUP">Airport Pickup</option>
                  <option value="AIRPORT_DROPOFF">Airport Dropoff</option>
                  <option value="ROUND_TRIP">Round Trip</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="passengers">Passengers</label>
                <input 
                  type="number" 
                  id="passengers" 
                  formControlName="passengers" 
                  min="1" 
                  max="6"
                >
              </div>
              
              <div class="form-group half">
                <label for="luggage">Luggage</label>
                <input 
                  type="number" 
                  id="luggage" 
                  formControlName="luggage" 
                  min="0"
                >
              </div>
            </div>
            
            <div class="fare-estimate" *ngIf="fareEstimate">
              <h3>Fare Estimate</h3>
              <p>Base Fare: {{ fareEstimate.base_fare }} {{ fareEstimate.currency }}</p>
              <p>Distance Fare: {{ fareEstimate.distance_fare }} {{ fareEstimate.currency }}</p>
              <p>Distance: {{ fareEstimate.distance }} {{ fareEstimate.unit }}</p>
              <p>Duration: {{ fareEstimate.estimated_duration }}</p>
              <p class="total">Total: {{ fareEstimate.total_fare }} {{ fareEstimate.currency }}</p>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn secondary" (click)="estimateFare()" [disabled]="!canEstimateFare()">
                Estimate Fare
              </button>
              <button type="submit" class="btn primary" [disabled]="bookingForm.invalid">
                Book Now
              </button>
            </div>
          </form>
        </ng-container>
        
        <ng-container *ngIf="currentBooking">
          <div class="booking-details">
            <p><strong>Booking ID:</strong> {{ currentBooking.booking_id }}</p>
            <p><strong>From:</strong> {{ currentBooking.pickup_location }}</p>
            <p><strong>To:</strong> {{ currentBooking.dropoff_location }}</p>
            <p><strong>Status:</strong> {{ currentBooking.booking_status }}</p>
            <p><strong>Distance:</strong> {{ currentBooking.total_distance }} km</p>
            <p><strong>Price:</strong> {{ currentBooking.total_price }} {{ currentBooking.currency }}</p>
            <p><strong>Estimated Duration:</strong> {{ currentBooking.estimatedDuration }}</p>
          </div>
          
          <div class="booking-actions" *ngIf="isCustomer">
            <ng-container [ngSwitch]="currentBooking.booking_status">
              <ng-container *ngSwitchCase="'PENDING'">
                <button class="btn warning" (click)="cancelBooking()">Cancel Booking</button>
              </ng-container>
              
              <ng-container *ngSwitchCase="'CONFIRMED'">
                <button class="btn warning" (click)="cancelBooking()">Cancel Booking</button>
              </ng-container>
              
              <ng-container *ngSwitchCase="'COMPLETED'">
                <div class="payment-options" *ngIf="currentBooking.payment_status === 'PENDING'">
                  <h3>Payment Options</h3>
                  <div class="payment-methods">
                    <button class="btn payment-btn" (click)="payWithCash()">Pay with Cash</button>
                    <button class="btn payment-btn" (click)="payWithCard()">Pay with Card</button>
                  </div>
                </div>
                
                <div class="rating-form" *ngIf="currentBooking.payment_status === 'PAID'">
                  <h3>Rate Your Driver</h3>
                  <div class="rating-stars">
                    <span 
                      *ngFor="let star of [1, 2, 3, 4, 5]" 
                      class="star" 
                      [class.active]="rating >= star"
                      (click)="setRating(star)"
                    >★</span>
                  </div>
                  <textarea 
                    [(ngModel)]="ratingComment" 
                    placeholder="Leave a comment (optional)"
                    class="rating-comment"
                  ></textarea>
                  <button class="btn primary" (click)="submitRating()">Submit Rating</button>
                </div>
              </ng-container>
            </ng-container>
          </div>
          
          <div class="booking-actions" *ngIf="isDriver">
            <ng-container [ngSwitch]="currentBooking.booking_status">
              <ng-container *ngSwitchCase="'PENDING'">
                <button class="btn primary" (click)="acceptBooking()">Accept Booking</button>
                <button class="btn warning" (click)="rejectBooking()">Reject Booking</button>
              </ng-container>
              
              <ng-container *ngSwitchCase="'CONFIRMED'">
                <button class="btn primary" (click)="startRide()">Start Ride</button>
              </ng-container>
              
              <ng-container *ngSwitchCase="'IN_PROGRESS'">
                <button class="btn primary" (click)="completeRide()">Complete Ride</button>
              </ng-container>
            </ng-container>
          </div>
          
          <div class="pickup-points" *ngIf="pickupPoints.length > 0">
            <h3>Pickup Points</h3>
            <ul class="pickup-list">
              <li *ngFor="let point of pickupPoints" class="pickup-item">
                <div class="pickup-info">
                  <p><strong>{{ point.passenger_name }}</strong></p>
                  <p>Price: {{ point.price_amount.toFixed(2) }} {{ currentBooking.currency }}</p>
                  <p>Status: {{ point.pickup_status }}</p>
                </div>
                <div class="pickup-actions" *ngIf="isDriver && currentBooking.booking_status === 'IN_PROGRESS'">
                  <button 
                    class="btn sm primary" 
                    (click)="updatePickupStatus(point.pickup_point_id, 'PICKED_UP')"
                    [disabled]="point.pickup_status === 'PICKED_UP'"
                  >
                    Mark as Picked Up
                  </button>
                </div>
              </li>
            </ul>
          </div>
          
          <div class="add-pickup-form" *ngIf="isCustomer && ['CONFIRMED', 'IN_PROGRESS'].includes(currentBooking.booking_status)">
            <h3>Add Pickup Point</h3>
            <form [formGroup]="pickupForm" (ngSubmit)="addPickupPoint()">
              <div class="form-group">
                <label for="passenger_name">Passenger Name</label>
                <input 
                  type="text" 
                  id="passenger_name" 
                  formControlName="passenger_name" 
                  placeholder="Enter passenger name"
                >
              </div>
              
              <div class="form-group">
                <label for="passenger_phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="passenger_phone" 
                  formControlName="passenger_phone" 
                  placeholder="Enter phone number"
                >
              </div>
              
              <div class="form-group">
                <label for="passenger_email">Email</label>
                <input 
                  type="email" 
                  id="passenger_email" 
                  formControlName="passenger_email" 
                  placeholder="Enter email"
                >
              </div>
              
              <div class="form-group location-input">
                <label>Pickup Location</label>
                <div class="coordinates" *ngIf="newPickupCoords">
                  Lat: {{ newPickupCoords.lat.toFixed(6) }}, Lng: {{ newPickupCoords.lng.toFixed(6) }}
                </div>
                <button type="button" class="btn btn-sm" (click)="useMapForPickup()">
                  Select on Map
                </button>
              </div>
              
              <button type="submit" class="btn primary" [disabled]="pickupForm.invalid || !newPickupCoords">
                Add Pickup Point
              </button>
            </form>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .booking-container {
      display: flex;
      height: 100%;
      width: 100%;
    }
    
    .map-section {
      flex: 1;
      height: 100%;
    }
    
    .booking-panel {
      width: 400px;
      height: 100%;
      overflow-y: auto;
      padding: 20px;
      background-color: #ffffff;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .panel-title {
      margin-top: 0;
      margin-bottom: 20px;
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
    
    .form-group input, .form-group select, .form-group textarea {
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
    
    .coordinates {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    
    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
    }
    
    .primary {
      background-color: #0066CC;
      color: white;
    }
    
    .secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .warning {
      background-color: #dc3545;
      color: white;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .fare-estimate {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .fare-estimate h3 {
      margin-top: 0;
    }
    
    .fare-estimate .total {
      font-weight: bold;
      font-size: 18px;
    }
    
    .booking-details {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .payment-options {
      margin-top: 20px;
    }
    
    .payment-methods {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .payment-btn {
      flex: 1;
    }
    
    .rating-form {
      margin-top: 20px;
    }
    
    .rating-stars {
      display: flex;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .star {
      color: #ddd;
      cursor: pointer;
      padding: 0 5px;
    }
    
    .star.active {
      color: #FFD700;
    }
    
    .rating-comment {
      width: 100%;
      height: 80px;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .pickup-list {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    
    .pickup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .add-pickup-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    
    .location-input {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class BookingComponent implements OnInit {
  mapCenter: [number, number] = [33.5731, -7.5898]; // Default: Casablanca
  mapZoom: number = 13;
  nearbyDrivers: Driver[] = [];
  currentBooking: Booking | null = null;
  pickupPoints: PickupPoint[] = [];
  
  bookingForm: FormGroup;
  pickupForm: FormGroup;
  
  pickupCoords: { lat: number, lng: number } | null = null;
  dropoffCoords: { lat: number, lng: number } | null = null;
  newPickupCoords: { lat: number, lng: number } | null = null;
  selectingForPickup = false;
  
  fareEstimate: any = null;
  
  rating: number = 0;
  ratingComment: string = '';
  
constructor(
     private fb: FormBuilder,
     @Inject(BookingService) private bookingService: BookingService,
     @Inject(DriverService) private driverService: DriverService,
     @Inject(PaymentService) private paymentService: PaymentService,
     @Inject(AuthService) private authService: AuthService,
) {
    this.bookingForm = this.fb.group({
      pickup_location: ['', Validators.required],
      dropoff_location: ['', Validators.required],
      pickup_datetime: [this.formatDateForInput(new Date()), Validators.required],
      vehicle_type: ['SEDAN', Validators.required],
      ride_type: ['INTRA_CITY', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
      luggage: [0, [Validators.required, Validators.min(0)]]
    });
    
    this.pickupForm = this.fb.group({
      passenger_name: ['', Validators.required],
      passenger_phone: ['', Validators.required],
      passenger_email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.loadUserBooking();
    this.getNearbyDrivers();
  }
  
  get isCustomer(): boolean {
    return this.authService.isCustomer;
  }
  
  get isDriver(): boolean {
    return this.authService.isDriver;
  }
  
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.mapCenter = [position.coords.latitude, position.coords.longitude];
        },
        () => {
          console.error('Unable to get location');
        }
      );
    }
  }
  
  loadUserBooking(): void {
    if (this.authService.isLoggedIn) {
      this.bookingService.getUserBookings().subscribe(
        (response: any) => {
          // Find active booking (not COMPLETED or CANCELLED)
          const activeBooking = response.bookings?.find((booking: Booking) => 
            !['COMPLETED', 'CANCELLED'].includes(booking.booking_status)
          );
          
          if (activeBooking) {
            this.currentBooking = activeBooking;
            this.loadPickupPoints();
          }
        },
        (error: any) => {
          console.error('Error loading bookings', error);
        }
      );
    }
  }
  
  loadPickupPoints(): void {
    if (this.currentBooking) {
      this.bookingService.getPickupPoints(this.currentBooking.booking_id).subscribe(
        (response: any) => {
          this.pickupPoints = response.pickupPoints || [];
        },
        (error: any) => {
          console.error('Error loading pickup points', error);
        }
      );
    }
  }
  
  getNearbyDrivers(): void {
    if (this.mapCenter) {
      this.driverService.getAvailableDrivers(this.mapCenter[0], this.mapCenter[1]).subscribe(
        (response: any) => {
          this.nearbyDrivers = response.drivers || [];
        },
        (error: any) => {
          console.error('Error loading drivers', error);
        }
      );
    }
  }
  
  onMapClicked(event: {lat: number, lng: number}): void {
    if (this.selectingForPickup) {
      this.newPickupCoords = event;
      this.selectingForPickup = false;
    } else if (!this.pickupCoords) {
      this.pickupCoords = event;
      this.bookingForm.patchValue({
        pickup_location: `Lat: ${event.lat.toFixed(6)}, Lng: ${event.lng.toFixed(6)}`
      });
    } else if (!this.dropoffCoords) {
      this.dropoffCoords = event;
      this.bookingForm.patchValue({
        dropoff_location: `Lat: ${event.lat.toFixed(6)}, Lng: ${event.lng.toFixed(6)}`
      });
    }
  }
  
  onDriverSelected(driver: Driver): void {
    // Set the selected driver for the booking
    console.log('Selected driver:', driver);
  }
  
  setAsPickup(): void {
    if (this.mapCenter) {
      this.pickupCoords = { lat: this.mapCenter[0], lng: this.mapCenter[1] };
      this.bookingForm.patchValue({
        pickup_location: `Current Location (${this.mapCenter[0].toFixed(6)}, ${this.mapCenter[1].toFixed(6)})`
      });
    }
  }
  
  setAsDropoff(): void {
    if (this.mapCenter) {
      this.dropoffCoords = { lat: this.mapCenter[0], lng: this.mapCenter[1] };
      this.bookingForm.patchValue({
        dropoff_location: `Current Location (${this.mapCenter[0].toFixed(6)}, ${this.mapCenter[1].toFixed(6)})`
      });
    }
  }
  
  canEstimateFare(): boolean {
    return !!this.pickupCoords && !!this.dropoffCoords;
  }
  
  estimateFare(): void {
    if (!this.pickupCoords || !this.dropoffCoords) return;
    
    const params = {
      pickup_lat: this.pickupCoords.lat,
      pickup_lng: this.pickupCoords.lng,
      dropoff_lat: this.dropoffCoords.lat,
      dropoff_lng: this.dropoffCoords.lng,
      vehicle_type: this.bookingForm.value.vehicle_type,
      ride_type: this.bookingForm.value.ride_type
    };
    
    this.bookingService.estimateFare(params).subscribe(
      (response: any) => {
        this.fareEstimate = response;
      },
      (error: any) => {
        console.error('Error estimating fare', error);
      }
    );
  }
  
  createBooking(): void {
    if (!this.pickupCoords || !this.dropoffCoords) return;
    
    const bookingData = {
      ...this.bookingForm.value,
      pickup_lat: this.pickupCoords.lat,
      pickup_lng: this.pickupCoords.lng,
      dropoff_lat: this.dropoffCoords.lat,
      dropoff_lng: this.dropoffCoords.lng
    };
    
    this.bookingService.createBooking(bookingData).subscribe(
      (response: any) => {
        this.currentBooking = response.booking;
        this.pickupPoints = [];
      },
      (error: any) => {
        console.error('Error creating booking', error);
      }
    );
  }
  
  cancelBooking(): void {
    if (!this.currentBooking) return;
    
    this.bookingService.updateBookingStatus(this.currentBooking.booking_id, 'CANCELLED').subscribe(
      () => {
        this.currentBooking = null;
        this.pickupPoints = [];
      },
      (error: any) => {
        console.error('Error cancelling booking', error);
      }
    );
  }
  
  acceptBooking(): void {
    if (!this.currentBooking) return;
    
    this.bookingService.updateBookingStatus(this.currentBooking.booking_id, 'CONFIRMED').subscribe(
      (response: any) => {
        this.currentBooking = response.booking;
      },
      (error: any) => {
        console.error('Error accepting booking', error);
      }
    );
  }
  
  rejectBooking(): void {
    if (!this.currentBooking) return;
    
    this.bookingService.updateBookingStatus(this.currentBooking.booking_id, 'CANCELLED').subscribe(
      () => {
        this.currentBooking = null;
      },
      (error: any) => {
        console.error('Error rejecting booking', error);
      }
    );
  }
  
  startRide(): void {
    if (!this.currentBooking) return;
    
    this.bookingService.updateBookingStatus(this.currentBooking.booking_id, 'IN_PROGRESS').subscribe(
      (response: any) => {
        this.currentBooking = response.booking;
      },
      (error: any) => {
        console.error('Error starting ride', error);
      }
    );
  }
  
  completeRide(): void {
    if (!this.currentBooking) return;
    
    this.paymentService.completeRide(this.currentBooking.booking_id).subscribe(
      (response: any) => {
        this.currentBooking = response.booking;
      },
      (error: any) => {
        console.error('Error completing ride', error);
      }
    );
  }
  
  useMapForPickup(): void {
    this.selectingForPickup = true;
  }
  
  addPickupPoint(): void {
    if (!this.currentBooking || !this.newPickupCoords) return;
    
    const pickupData = {
      ...this.pickupForm.value,
      latitude: this.newPickupCoords.lat,
      longitude: this.newPickupCoords.lng
    };
    
    this.bookingService.addPickupPoint(this.currentBooking.booking_id, pickupData).subscribe(
      (response: any) => {
        this.pickupPoints = [...this.pickupPoints, response.pickupPoint];
        this.pickupForm.reset();
        this.newPickupCoords = null;
      },
      (error: any) => {
        console.error('Error adding pickup point', error);
      }
    );
  }
  
  updatePickupStatus(pickupPointId: string, status: string): void {
    if (!this.currentBooking) return;
    
    this.bookingService.updatePickupStatus(this.currentBooking.booking_id, pickupPointId, status).subscribe(
      () => {
        this.loadPickupPoints();
      },
      (error: any) => {
        console.error('Error updating pickup status', error);
      }
    );
  }
  
  payWithCash(): void {
    if (!this.currentBooking) return;
    
    this.paymentService.createCashPayment(this.currentBooking.booking_id).subscribe(
      (response: any) => {
        this.currentBooking = response.booking;
      },
      (error: any) => {
        console.error('Error processing cash payment', error);
      }
    );
  }
  
  payWithCard(): void {
    // In a real app, you would open a card payment form or modal here
    console.log('Open card payment form');
  }
  
  setRating(value: number): void {
    this.rating = value;
  }
  
  submitRating(): void {
    if (!this.currentBooking || this.rating === 0) return;
    
    const ratingData = {
      booking_id: this.currentBooking.booking_id,
      driver_id: this.currentBooking.driver_id,
      rating: this.rating,
      comment: this.ratingComment
    };
    
    this.driverService.rateDriver(ratingData).subscribe(
      () => {
        // Reset rating form
        this.rating = 0;
        this.ratingComment = '';
        
        // Reload booking to reflect updated status
        this.loadUserBooking();
      },
      (error: any) => {
        console.error('Error submitting rating', error);
      }
    );
  }
}