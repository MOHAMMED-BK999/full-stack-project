import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrls: ['./connexion.css'],
})
export class Connexion implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    if (this.customerService.isLoggedIn()) {
      void this.router.navigate(['/accueil']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.customerService.login(email, password, rememberMe).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/accueil']);
      },
      error: (err: Error | HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage =
          err instanceof HttpErrorResponse
            ? err.error?.message || err.error?.error || err.message || 'Unable to sign in'
            : err.message;
      },
    });
  }
}
