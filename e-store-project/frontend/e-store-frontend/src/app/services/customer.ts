import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

export interface CustomerRegistrationPayload {
  prenom: string;
  nom: string;
  email: string;
  password: string;
}

export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  address?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  // Backend runs on 8080 by default (Spring Boot). If you change the backend port,
  // update this value (or better: move it to an environment config).
  private readonly apiUrl = 'http://localhost:8080/api/customers';
  private readonly storageKey = 'nexshop_current_customer';
  private readonly currentCustomerSubject = new BehaviorSubject<Customer | null>(null);
  readonly currentCustomer$ = this.currentCustomerSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  register(payload: CustomerRegistrationPayload): Observable<Customer> {
    const customerRequest = {
      firstName: payload.prenom.trim(),
      lastName: payload.nom.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      phoneNumber: null,
      address: null,
    };

    return this.http.post<Customer>(`${this.apiUrl}/register`, customerRequest);
  }

  getCustomerByEmail(email: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${encodeURIComponent(email.trim().toLowerCase())}`);
  }

  login(email: string, password: string, rememberMe: boolean): Observable<Customer> {
    return this.getCustomerByEmail(email).pipe(
      map((customer) => {
        if (customer.password !== password) {
          throw new Error('Invalid email or password');
        }
        return customer;
      }),
      tap((customer) => this.persistSession(customer, rememberMe))
    );
  }

  logout(): void {
    this.clearSession();
    this.currentCustomerSubject.next(null);
  }

  getCurrentCustomer(): Customer | null {
    return this.currentCustomerSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentCustomerSubject.value !== null;
  }

  private persistSession(customer: Customer, rememberMe: boolean): void {
    this.clearSession();
    this.currentCustomerSubject.next(customer);

    if (!this.isBrowser()) {
      return;
    }

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(this.storageKey, JSON.stringify(customer));
  }

  private restoreSession(): void {
    if (!this.isBrowser()) {
      return;
    }

    const saved =
      window.localStorage.getItem(this.storageKey) ?? window.sessionStorage.getItem(this.storageKey);

    if (!saved) {
      return;
    }

    try {
      this.currentCustomerSubject.next(JSON.parse(saved) as Customer);
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
    window.sessionStorage.removeItem(this.storageKey);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
