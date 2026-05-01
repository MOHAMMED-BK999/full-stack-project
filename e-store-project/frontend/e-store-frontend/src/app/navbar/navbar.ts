import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerService } from '../services/customer';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  constructor(
    public customerService: CustomerService,
    private router: Router
  ) {}

  logout(): void {
    this.customerService.logout();
    void this.router.navigate(['/accueil']);
  }
}
