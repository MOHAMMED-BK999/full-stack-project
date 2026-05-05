import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Customer, CustomerService } from '../services/customer';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  customer: Customer | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.customer = this.customerService.getCurrentCustomer();

    if (!this.customer) {
      void this.router.navigate(['/connexion']);
      return;
    }

    this.profileForm.patchValue({
      firstName: this.customer.firstName ?? '',
      lastName: this.customer.lastName ?? '',
      phoneNumber: this.customer.phoneNumber ?? '',
      address: this.customer.address ?? '',
    });
  }

  startEdit(): void {
    if (!this.customer) {
      return;
    }

    this.errorMessage = '';
    this.isEditing = true;
    this.profileForm.patchValue({
      firstName: this.customer.firstName ?? '',
      lastName: this.customer.lastName ?? '',
      phoneNumber: this.customer.phoneNumber ?? '',
      address: this.customer.address ?? '',
    });
  }

  cancelEdit(): void {
    this.errorMessage = '';
    this.isEditing = false;
  }

  saveProfile(): void {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { firstName, lastName, phoneNumber, address } = this.profileForm.getRawValue();

    this.customerService
      .updateProfile({
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phoneNumber: String(phoneNumber ?? '').trim() || null,
        address: String(address ?? '').trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.customer = updated;
          this.isSubmitting = false;
          this.isEditing = false;
          // Ensure we return to the profile "view" state (not the edit form).
          void this.router.navigate(['/profile']);
        },
        error: (err: unknown) => {
          this.isSubmitting = false;
          this.errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
        },
      });
  }

  logout(): void {
    this.customerService.logout();
    void this.router.navigate(['/accueil']);
  }
}
