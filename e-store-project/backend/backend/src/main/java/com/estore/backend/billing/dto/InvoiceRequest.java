package com.estore.backend.billing.dto;

import java.math.BigDecimal;

public record InvoiceRequest(
    String orderId,
    String customerId,
    BigDecimal totalAmount,
    String paymentMethod,
    String description) {
}
