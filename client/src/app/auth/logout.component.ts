import { Component } from '@angular/core';
import { AuthService } from './auth.service';  // Adjust path accordingly
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: `<button (click)="logout()">Logout</button>`
})
export class LogoutComponent {

  constructor(private authService: AuthService, private router: Router) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
