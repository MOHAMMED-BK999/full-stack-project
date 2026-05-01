import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Customer, CustomerService } from '../services/customer';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  customer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customer = this.customerService.getCurrentCustomer();

    if (!this.customer) {
      void this.router.navigate(['/connexion']);
    }
  }

  logout(): void {
    this.customerService.logout();
    void this.router.navigate(['/accueil']);
  }
}
