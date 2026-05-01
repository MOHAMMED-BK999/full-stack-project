package com.estore.backend.shopping.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private int productId;
    private String productName;
    private BigDecimal price;
    private String imageUrl;
    private int quantity;
    private BigDecimal totalPrice;
    private String customerId;
    private LocalDateTime orderDate = LocalDateTime.now();
    private String status = "Pending"; // Pending, Processing, Shipped, Delivered, Cancelled
    private String shippingAddress;
    private LocalDateTime deliveryDate;
    private String trackingNumber;
}