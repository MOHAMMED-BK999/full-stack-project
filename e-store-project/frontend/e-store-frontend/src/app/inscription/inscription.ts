import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.css'],
})
export class Inscription {
  registerForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        prenom: ['', Validators.required],
        nom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        // Removed the 'terms' control here so the form can become valid!
      },
      { validators: this.passwordMatchValidator },
    );
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword && confirmPassword !== '') {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      this.isSubmitting = true;

      const { confirmPassword, ...payload } = this.registerForm.getRawValue();
      void confirmPassword;

      this.customerService.register(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.registerForm.reset();
          void this.router.navigate(['/connexion']);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.errorMessage =
            err.error?.message ||
            err.error?.error ||
            err.message ||
            'Unable to create account';
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
