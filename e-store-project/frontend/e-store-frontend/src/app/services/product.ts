import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerService } from './customer';

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Backend runs on 8080 by default (Spring Boot). If you change the backend port,
  // update this value (or better: move it to an environment config).
  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient, private customerService: CustomerService) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addProduct(product: ProductPayload): Observable<any> {
    const productRequest = {
      name: product.name.trim(),
      description: product.description?.trim() || null,
      price: product.price,
      image: product.imageUrl.trim(),
    };

    return this.http.post<any>(this.apiUrl, productRequest, { headers: this.buildAdminHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.buildAdminHeaders() });
  }

  private buildAdminHeaders(): HttpHeaders {
    const email = this.customerService.getCurrentCustomer()?.email?.trim().toLowerCase() ?? '';
    return new HttpHeaders({ 'X-User-Email': email });
  }
}
