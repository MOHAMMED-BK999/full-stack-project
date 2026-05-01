import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerService } from './services/customer';

export const authGuard: CanActivateFn = () => {
  const customerService = inject(CustomerService);
  const router = inject(Router);

  return customerService.isLoggedIn() ? true : router.createUrlTree(['/connexion']);
};
