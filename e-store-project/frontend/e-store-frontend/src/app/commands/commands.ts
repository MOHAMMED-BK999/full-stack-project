import { afterNextRender, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { OrderService, Order } from '../catalog/order.service'; // Ensure the path is correct
import { BillService } from '../bills/bill.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-commands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commands.html',
  styleUrls: ['./commands.css']
})
export class Commands implements OnInit {
  myOrders: Order[] = [];
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deletingIds = new Set<string>();
  private readonly updatingQtyIds = new Set<string>();

  constructor(
    private orderService: OrderService,
    private billService: BillService
  ) {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.refreshOrders();
      }
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.orderService.orders$.subscribe((orders: Order[]) => {
      this.myOrders = orders;
    });

    this.refreshOrders();
  }

  private refreshOrders(): void {
    this.orderService.loadOrdersForCurrentCustomer().subscribe({
      next: () => {},
      error: (err) => console.error('Error loading orders', err),
    });
  }

  isDeleting(orderId: string): boolean {
    return this.deletingIds.has(orderId);
  }

  isUpdatingQuantity(orderId: string): boolean {
    return this.updatingQtyIds.has(orderId);
  }

  /**
   * Calculates the total price of all purchases
   */
  getTotal(): number {
    return this.myOrders.reduce((acc, order) => acc + order.totalPrice, 0);
  }

  /**
   * Optional: Logic to clear the command history
   */
  clearHistory(): void {
    if (confirm('Clear all order history?')) {
      this.myOrders = []; 
    }
  }

  deleteOrder(orderId: string) {
    const id = String(orderId ?? '').trim();
    if (!id) {
      alert('Missing order id');
      return;
    }

    if (this.isDeleting(orderId)) {
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.deletingIds.add(id);

    this.orderService
      .removeOrder(id)
      .pipe(finalize(() => this.deletingIds.delete(id)))
      .subscribe({
        next: () => {
          // OrderService already updates the shared subject; keep local state consistent too.
          this.myOrders = this.myOrders.filter((order) => order.id !== id);
          this.billService.loadBillsForCurrentCustomer().subscribe({
            next: () => {},
            error: (err) => console.error('Error refreshing bills', err),
          });
        },
        error: (err: unknown) => {
          const message =
            err instanceof HttpErrorResponse
              ? err.error?.message || err.error?.error || err.message || 'Failed to delete order'
              : err instanceof Error
                ? err.message
                : 'Failed to delete order';

          alert(message);
          console.error('Error deleting order', err);
        },
      });
  }

  changeQuantity(order: Order, delta: number): void {
    const id = String(order?.id ?? '').trim();
    if (!id) {
      alert('Missing order id');
      return;
    }

    const nextQty = (order.quantity ?? 1) + delta;
    // If user decrements from 1 to 0, treat it as removing/cancelling the order.
    if (nextQty <= 0) {
      this.deleteOrder(id);
      return;
    }

    if (this.isUpdatingQuantity(id)) {
      return;
    }

    this.updatingQtyIds.add(id);

    this.orderService
      .updateOrderQuantity(id, nextQty)
      .pipe(finalize(() => this.updatingQtyIds.delete(id)))
      .subscribe({
        next: () => {
          // Keep the list consistent with backend data (also ensures total price is correct).
          this.refreshOrders();
          this.billService.loadBillsForCurrentCustomer().subscribe({
            next: () => {},
            error: (err) => console.error('Error refreshing bills', err),
          });
        },
        error: (err: unknown) => {
          const message =
            err instanceof HttpErrorResponse
              ? err.error?.message || err.error?.error || err.message || 'Failed to update quantity'
              : err instanceof Error
                ? err.message
                : 'Failed to update quantity';
          alert(message);
          console.error('Error updating quantity', err);
        },
      });
  }
}
