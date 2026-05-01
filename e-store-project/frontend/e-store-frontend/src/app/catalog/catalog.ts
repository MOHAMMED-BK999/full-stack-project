import { afterNextRender, ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from './order.service';
import { ProductService } from '../services/product'; // Import your new service
import { BillService } from '../bills/bill.service';

interface Product {
  id?: number; // MongoDB IDs are strings
  name: string;
  description?: string; // Added to match your backend fix
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css'],
})
export class Catalog implements OnInit {
  productForm: FormGroup;
  showForm = false;
  searchTerm: string = '';
  products: Product[] = []; // Start with an empty array
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private productService: ProductService, // Inject the Backend Service
    private billService: BillService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''], // Matches backend entity
      price: ['', [Validators.required, Validators.min(0.01)]],
      imageUrl: ['', [Validators.required]],
    });

    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.loadProducts();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  // --- API Logic ---
  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching from backend:', err)
    });
  }

  onCreateProduct() {
    if (this.productForm.valid) {
      // Send the new product to Spring Boot
      this.productService.addProduct(this.productForm.value).subscribe({
        next: (newProduct) => {
          this.products = [newProduct, ...this.products]; // Add the saved product (with ID) to UI
          this.showForm = false;
          this.productForm.reset();
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err.error?.message ||
            err.error?.error ||
            err.message ||
            'Failed to save product';
          alert(message);
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  // --- Filtering Logic ---
  get filteredProducts() {
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  buyProduct(product: Product) {
    this.orderService.addOrder(product).subscribe({
      next: (order) => {
        this.billService.createBillForOrder(order).subscribe({
          next: () => {
            this.billService.loadBillsForCurrentCustomer().subscribe({
              next: () => alert('Order saved successfully'),
              error: () => alert('Order saved, but bills failed to refresh'),
            });
          },
          error: () => {
            this.billService.loadBillsForCurrentCustomer().subscribe({
              next: () => alert('Order saved successfully'),
              error: () => alert('Order saved, but bill creation failed'),
            });
          },
        });
      },
      error: (err: HttpErrorResponse | Error) => {
        const message =
          err instanceof HttpErrorResponse
            ? err.error?.message || err.error?.error || err.message || 'Failed to save order'
            : err.message;
        alert(message);
      },
    });
  }

  onOpenForm() {
    this.productForm.reset();
    this.showForm = true;
  }

  onCancel() {
    this.showForm = false;
  }

  removeProduct(id:number | undefined) {
    if (id === undefined) {
      return;
    }

    if (confirm('Delete this product from database?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((product) => product.id !== id);
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err.error?.message ||
            err.error?.error ||
            err.message ||
            'Failed to delete product';
          alert(message);
        },
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
