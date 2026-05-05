import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { CustomerService } from '../services/customer';

export interface Order {
  id: string;
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  totalPrice: number;
  customerId: string;
  date: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Backend runs on 8080 by default (Spring Boot). If you change the backend port,
  // update this value (or better: move it to an environment config).
  private readonly apiUrl = 'http://localhost:8080/api/orders';
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  readonly orders$ = this.ordersSubject.asObservable();
  private readonly cacheKeyPrefix = 'nexshop_orders_cache_v1_';

  constructor(
    private http: HttpClient,
    private customerService: CustomerService
  ) {}

  loadOrdersForCurrentCustomer(): Observable<Order[]> {
    const customer = this.customerService.getCurrentCustomer();
    if (!customer?.id) {
      this.ordersSubject.next([]);
      return of([]);
    }

    // Show last known orders immediately (helps after refresh even if the API is slow/unavailable).
    this.hydrateFromCache(String(customer.id));

    return this.http
      .get<any[]>(`${this.apiUrl}/customer/${customer.id}`)
      .pipe(
        map((orders) => orders.map((order) => this.mapOrder(order))),
        tap((orders) => this.setOrders(String(customer.id), orders))
      );
  }

  addOrder(product: { id?: number; name: string; price: number; imageUrl: string }): Observable<Order> {
    const customer = this.customerService.getCurrentCustomer();
    if (!customer?.id) {
      throw new Error('You must be logged in to place an order');
    }

    const orderRequest = {
      productId: product.id ?? 0,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      totalPrice: product.price,
      customerId: String(customer.id),
      status: 'Pending',
    };

    return this.http.post<any>(this.apiUrl, orderRequest).pipe(
      map((order) => this.mapOrder(order)),
      tap((order) => this.setOrders(String(customer.id), [order, ...this.ordersSubject.value]))
    );
  }

  removeOrder(orderId: string): Observable<void> {
    const customer = this.customerService.getCurrentCustomer();
    // With Angular's fetch-based HttpClient, a 204 No Content response can surface as a body-parse error
    // if we leave the responseType as JSON. Treat it as text and map to void.
    const id = encodeURIComponent(String(orderId ?? '').trim());
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => undefined),
      tap(() => {
        const nextOrders = this.ordersSubject.value.filter((order) => order.id !== orderId);
        if (customer?.id) {
          this.setOrders(String(customer.id), nextOrders);
        } else {
          this.ordersSubject.next(nextOrders);
        }
      })
    );
  }

  updateOrderQuantity(orderId: string, quantity: number): Observable<Order> {
    const customer = this.customerService.getCurrentCustomer();
    if (!orderId?.trim()) {
      throw new Error('Missing order id');
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const id = encodeURIComponent(orderId.trim());
    return this.http.put<any>(`${this.apiUrl}/${id}/quantity`, { quantity }).pipe(
      map((order) => this.mapOrder(order)),
      tap((updated) => {
        const nextOrders = this.ordersSubject.value.map((order) =>
          order.id === updated.id ? updated : order
        );
        if (customer?.id) {
          this.setOrders(String(customer.id), nextOrders);
        } else {
          this.ordersSubject.next(nextOrders);
        }
      })
    );
  }

  private setOrders(customerId: string, orders: Order[]): void {
    this.ordersSubject.next(orders);
    this.persistToCache(customerId, orders);
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
      const cached = JSON.parse(raw) as Order[];
      if (Array.isArray(cached)) {
        this.ordersSubject.next(cached);
      }
    } catch {
      // Ignore corrupted cache.
    }
  }

  private persistToCache(customerId: string, orders: Order[]): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(this.cacheKeyPrefix + customerId, JSON.stringify(orders));
    } catch {
      // Ignore quota/security errors.
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private mapOrder(order: any): Order {
    return {
      id: order.id,
      productId: order.productId,
      productName: order.productName,
      price: Number(order.price),
      imageUrl: order.imageUrl,
      quantity: order.quantity ?? 1,
      totalPrice: Number(order.totalPrice ?? order.price),
      customerId: order.customerId,
      date: order.orderDate,
      status: order.status,
    };
  }
}
