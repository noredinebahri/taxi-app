import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent {
  constructor(private router: Router) {}
  goToDashboard() {
    this.router.navigate(['/']); // Remplacez par la page que vous voulez rediriger
  }
}
