import { Routes } from '@angular/router';
import { BookingComponent } from './components/booking/booking.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { TripDetailsComponent } from './components/trip-details/trip-details.component';
import { ClientInfoComponent } from './components/client-info/client-info.component';
import { PriceDetailsComponent } from './components/price-details/price-details.component';
import { CancelComponent } from './cancel/cancel.component';
import { SuccessComponent } from './success/success.component';
import { PaymentComponent } from './components/payment/payment.component';

export const routes: Routes = [
     { path: '', component: HomeComponent },
     { path: 'booking', component: BookingComponent },
     { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
     { path: 'client-info', component: ClientInfoComponent },
     { path: 'price-details', component: PriceDetailsComponent }, // Affichage du prix

     { path: 'trip-details', component: TripDetailsComponent },
     { path: 'cancel', component: CancelComponent },
     { path: 'payment', component: PaymentComponent },
     { path: 'success', component: SuccessComponent },
     { path: '**', redirectTo: 'booking' }
];
