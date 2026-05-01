package com.estore.backend.billing.entity;

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
@Document(collection = "invoices")
public class Invoice {
  @Id
  private String id;
  private String orderId;
  private String customerId;
  private BigDecimal totalAmount;
  private String paymentStatus; // PENDING, PAID, FAILED
  private String paymentMethod; // CREDIT_CARD, PAYPAL, BANK_TRANSFER
  private LocalDateTime invoiceDate = LocalDateTime.now();
  private LocalDateTime paymentDate;
  private String description;
}
