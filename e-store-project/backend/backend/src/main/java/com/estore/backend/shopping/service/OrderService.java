package com.estore.backend.shopping.service;

import com.estore.backend.billing.dto.InvoiceRequest;
import com.estore.backend.billing.service.InvoiceService;
import com.estore.backend.shopping.entity.Order;
import com.estore.backend.shopping.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

  private final OrderRepository orderRepository;
  private final InvoiceService invoiceService;

  public OrderService(OrderRepository orderRepository, InvoiceService invoiceService) {
    this.orderRepository = orderRepository;
    this.invoiceService = invoiceService;
  }

  public List<Order> getAllOrders() {
    return orderRepository.findAll();
  }

  public Order getOrderById(String id) {
    return orderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
  }

  public Order placeOrder(Order order) {
    if (order.getProductName() == null || order.getProductName().trim().isEmpty()) {
      throw new IllegalArgumentException("Product name is required");
    }
    if (order.getPrice() == null || order.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Price must be greater than 0");
    }
    if (order.getCustomerId() == null || order.getCustomerId().trim().isEmpty()) {
      throw new IllegalArgumentException("Customer id is required");
    }

    if (order.getQuantity() <= 0) {
      order.setQuantity(1);
    }

    if (order.getTotalPrice() == null || order.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
      order.setTotalPrice(order.getPrice().multiply(BigDecimal.valueOf(order.getQuantity())));
    }

    Order savedOrder = orderRepository.save(order);
    invoiceService.createInvoice(new InvoiceRequest(
        savedOrder.getId(),
        savedOrder.getCustomerId(),
        savedOrder.getTotalPrice(),
        "CASH_ON_DELIVERY",
        "Invoice for order " + savedOrder.getProductName()
    ));
    return savedOrder;
  }

  public void cancelOrder(String id) {
    // Deleting should be best-effort and idempotent: if the order doesn't exist, treat as success.
    // Also avoid coupling deletion to a prior read, which can fail if the client holds a stale/invalid id.
    invoiceService.deleteInvoiceByOrderId(id);
    orderRepository.deleteById(id);
  }

  public void cancelOrdersByCustomerId(String customerId) {
    var orders = orderRepository.findByCustomerId(customerId);
    for (Order order : orders) {
      invoiceService.deleteInvoiceByOrderId(order.getId());
    }
    orderRepository.deleteAll(orders);
  }

  public Order updateOrderQuantity(String id, int quantity) {
    if (quantity <= 0) {
      throw new IllegalArgumentException("Quantity must be greater than 0");
    }

    Order order = getOrderById(id);
    order.setQuantity(quantity);

    if (order.getPrice() != null) {
      order.setTotalPrice(order.getPrice().multiply(BigDecimal.valueOf(quantity)));
    }

    Order saved = orderRepository.save(order);
    if (saved.getTotalPrice() != null) {
      invoiceService.updateInvoiceTotalByOrderId(saved.getId(), saved.getTotalPrice());
    }
    return saved;
  }

  public List<Order> getOrdersByStatus(String status) {
    return orderRepository.findAll().stream()
        .filter(order -> order.getStatus().equalsIgnoreCase(status))
        .toList();
  }

  public List<Order> getOrdersByCustomerId(String customerId) {
    return orderRepository.findByCustomerId(customerId);
  }
}
