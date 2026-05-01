import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { CustomerService } from '../services/customer';
import { Order } from '../catalog/order.service';

export interface Bill {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  date: string;
  paymentDate?: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class BillService {
  // Backend runs on 8080 by default (Spring Boot). If you change the backend port,
  // update this value (or better: move it to an environment config).
  private readonly apiUrl = 'http://localhost:8080/api/invoices';
  private readonly billsSubject = new BehaviorSubject<Bill[]>([]);
  readonly bills$ = this.billsSubject.asObservable();
  private readonly cacheKeyPrefix = 'nexshop_bills_cache_v1_';

  constructor(
    private http: HttpClient,
    private customerService: CustomerService
  ) {}

  createBillForOrder(order: Order): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalPrice,
      paymentMethod: 'CASH_ON_DELIVERY',
      description: `Invoice for order ${order.productName}`,
    });
  }

  loadBillsForCurrentCustomer(): Observable<Bill[]> {
    const customer = this.customerService.getCurrentCustomer();
    if (!customer?.id) {
      this.billsSubject.next([]);
      return of([]);
    }

    // Show last known bills immediately (helps after refresh even if the API is slow/unavailable).
    this.hydrateFromCache(String(customer.id));

    return this.http.get<any[]>(`${this.apiUrl}/customer/${customer.id}`).pipe(
      map((bills) =>
        bills.map((bill) => ({
          id: bill.id,
          orderId: bill.orderId,
          customerId: bill.customerId,
          customerName: `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
          date: bill.invoiceDate,
          paymentDate: bill.paymentDate,
          totalAmount: Number(bill.totalAmount),
          status: bill.paymentStatus,
          paymentMethod: bill.paymentMethod || 'N/A',
          description: bill.description || 'No description',
        }))
      ),
      tap((bills) => this.setBills(String(customer.id), bills))
    );
  }

  private setBills(customerId: string, bills: Bill[]): void {
    this.billsSubject.next(bills);
    this.persistToCache(customerId, bills);
  }

  private hydrateFromCache(customerId: string): void {
    if (!this.isBrowser()) {
      return;
    }

    const raw = window.localStorage.getItem(this.cacheKeyPrefix + customerId);
    if (!raw) {
      return;
    }

    try {
      const cached = JSON.parse(raw) as Bill[];
      if (Array.isArray(cached)) {
        this.billsSubject.next(cached);
      }
    } catch {
      // Ignore corrupted cache.
    }
  }

  private persistToCache(customerId: string, bills: Bill[]): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(this.cacheKeyPrefix + customerId, JSON.stringify(bills));
    } catch {
      // Ignore quota/security errors.
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
