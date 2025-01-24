import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router, private translate: TranslateService ,private authService: AuthService) {
    this.translate.addLangs(['en', 'fr', 'es', 'ar']);
    this.translate.setDefaultLang('en');
  }
  isMenuOpen: boolean = false;  // Contrôle du menu burger
  changeLanguage(lang: any): void {
    this.translate.use(lang.target.value);
  }
  // Ouvre/Ferme le menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Fermer le menu quand on clique sur un lien
  closeMenu(): void {
    this.isMenuOpen = false;
  }
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
