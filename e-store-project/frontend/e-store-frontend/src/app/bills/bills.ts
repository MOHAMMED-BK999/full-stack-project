import { afterNextRender, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { BillService, Bill } from './bill.service'

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bills.html',
  styleUrls: ['./bills.css'],
})
export class Bills implements OnInit {
  bills: Bill[] = [];
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private billService: BillService) {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.refreshBills();
      }
    });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.billService.bills$.subscribe({
      next: (data) => this.bills = data,
    });

    this.refreshBills();
  }

  private refreshBills(): void {
    this.billService.loadBillsForCurrentCustomer().subscribe({
      next: () => {},
      error: (err) => console.error('Error loading bills', err),
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'status-paid';
      case 'FAILED':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  }
}
