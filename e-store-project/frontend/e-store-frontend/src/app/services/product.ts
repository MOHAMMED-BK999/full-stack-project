import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

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

    return this.http.post<any>(this.apiUrl, productRequest);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
