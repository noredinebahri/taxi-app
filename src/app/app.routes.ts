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
import { AuthComponent } from './components/auth/auth.component';
import { VerifyComponent } from './components/auth/verify/verify.component';
import { NoAuthGuard } from './guards/notAuth.guard';

export const routes: Routes = [
     { path: '', component: HomeComponent },
     { path: 'booking', component: BookingComponent, canActivate: [AuthGuard] },
     { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
     { path: 'client-info', component: ClientInfoComponent, canActivate: [AuthGuard] },
     { path: 'price-details', component: PriceDetailsComponent, canActivate: [AuthGuard] }, // Affichage du prix
     { path: 'trip-details', component: TripDetailsComponent, canActivate: [AuthGuard] },

     //auth
     { path: 'auth', component: AuthComponent, canActivate: [NoAuthGuard] },
     { path: 'verify/:token', component: VerifyComponent },

     //payments
     { path: 'cancel', component: CancelComponent, canActivate: [AuthGuard] },
     { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
     { path: 'success', component: SuccessComponent, canActivate: [AuthGuard] },

     { path: '**', redirectTo: 'auth' }
];
