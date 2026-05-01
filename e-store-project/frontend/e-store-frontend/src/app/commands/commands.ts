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
    if (this.isDeleting(orderId)) {
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.deletingIds.add(orderId);

    this.orderService
      .removeOrder(orderId)
      .pipe(finalize(() => this.deletingIds.delete(orderId)))
      .subscribe({
        next: () => {
          // OrderService already updates the shared subject; keep local state consistent too.
          this.myOrders = this.myOrders.filter((order) => order.id !== orderId);
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
}
