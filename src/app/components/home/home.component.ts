import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']  
})
export class HomeComponent {
  isBookingPopupVisible: boolean = false;
  isLoading: boolean = true;
  showScrollToTop: boolean = false;
  scrollProgress: number = 0;
  bookingUrl: SafeResourceUrl;
  isMenuOpen: boolean = false;  // Contrôle du menu burger

  // Ouvre/Ferme le menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Fermer le menu quand on clique sur un lien
  closeMenu(): void {
    this.isMenuOpen = false;
  }
  constructor(private sanitizer: DomSanitizer) {
    // Lien sécurisé vers la page de réservation
    this.bookingUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/booking');
  }

  // Ouvre le popup de réservation
  openBookingPopup(): void {
    this.isBookingPopupVisible = true;
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;  // Simule le chargement de la page
    }, 2000);  // À ajuster selon la vitesse de chargement réelle
  }

  // Ferme le popup de réservation
  closeBookingPopup(): void {
    this.isBookingPopupVisible = false;
  }

  // Défilement fluide vers le haut
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Suivi du défilement pour afficher le bouton "Scroll to Top" et la barre de progression
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    this.scrollProgress = (scrollTop / scrollHeight) * 100;
    this.showScrollToTop = scrollTop > 300;
  }
}
