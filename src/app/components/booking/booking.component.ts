import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatCardModule,
    CommonModule,
    TranslatePipe,
  ],
  providers: [MatSnackBar],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  airports: any[] = [];
  citiesMorocco: any[] = [];
  language: string = 'en'; // Langue actuelle

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private translate: TranslateService
  ) {
    console.log(this.translate);
    
    this.translate.addLangs(['en', 'fr', 'es', 'ar']);
    this.translate.setDefaultLang('en'); // Définit la langue par défaut
    this.bookingForm = this.fb.group({
      airport: ['', Validators.required],
      city: ['', Validators.required],
    });

    // Écoute les changements de langue
    this.translate.onLangChange.subscribe(() => {
      this.translateAirportNames(); // Traduire les noms à chaque changement de langue
    });
  }

  ngOnInit(): void {
    this.loadAirports();
    this.loadCities();
  }

  // Charger les aéroports et les traduire
  loadAirports(): void {
    this.bookingService.getAirports().subscribe({
      next: (data: any[]) => {
        this.airports = data;
        this.translateAirportNames(); // Traduire les noms
      },
      error: (err) => console.error('Erreur de chargement des aéroports', err),
    });
  }

  // Traduire les noms des aéroports
  translateAirportNames(): void {
    const translationObservables = this.airports.map((airport) =>
      this.translate.get(airport.airport_name)
    );

    // Attendre que toutes les traductions soient prêtes
    forkJoin(translationObservables).subscribe((translations: string[]) => {
      this.airports = this.airports.map((airport, index) => ({
        ...airport,
        airport_name: translations[index], // Appliquer la traduction
      }));
    });
  }

  // Charger les villes
  loadCities(): void {
    this.bookingService.getCities().subscribe({
      next: (data: any[]) => {
        this.citiesMorocco = data;
      },
      error: (err) => console.error('Erreur de chargement des villes', err),
    });
  }

  onAirportChange(event: any): void {
    const airportId = event.target.value;
    console.log('Aéroport sélectionné :', airportId);
  }

  onCityChange(event: any): void {
    const cityId = event.target.value;
    console.log('Ville sélectionnée :', cityId);
  }

  submitBooking(): void {
    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value;

      // Sauvegarder temporairement les données
      localStorage.setItem('bookingData', JSON.stringify(bookingData));

      // Redirection vers la page des détails
      console.log('Données de réservation sauvegardées.');
    } else {
      console.error('Le formulaire est invalide.');
    }
  }
}
