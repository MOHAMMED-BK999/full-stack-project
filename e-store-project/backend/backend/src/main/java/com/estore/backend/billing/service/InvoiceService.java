package com.estore.backend.billing.service;

import com.estore.backend.billing.dto.InvoiceRequest;
import com.estore.backend.billing.entity.Invoice;
import com.estore.backend.billing.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class InvoiceService {

  private final InvoiceRepository invoiceRepository;

  public InvoiceService(InvoiceRepository invoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  public List<Invoice> getAllInvoices() {
    return invoiceRepository.findAll();
  }

  public Invoice getInvoiceById(String id) {
    return invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
  }

  public Invoice createInvoice(InvoiceRequest request) {
    Invoice invoice = new Invoice();
    invoice.setOrderId(request.orderId());
    invoice.setCustomerId(request.customerId());
    invoice.setTotalAmount(request.totalAmount());
    invoice.setPaymentMethod(request.paymentMethod());
    invoice.setDescription(request.description());
    invoice.setPaymentStatus("PENDING");
    return invoiceRepository.save(invoice);
  }

  public Invoice markAsPaid(String id) {
    Invoice invoice = getInvoiceById(id);
    invoice.setPaymentStatus("PAID");
    invoice.setPaymentDate(java.time.LocalDateTime.now());
    return invoiceRepository.save(invoice);
  }

  public List<Invoice> getInvoicesByCustomerId(String customerId) {
    return invoiceRepository.findByCustomerId(customerId);
  }

  public List<Invoice> getInvoicesByPaymentStatus(String status) {
    return invoiceRepository.findByPaymentStatus(status);
  }

  public void deleteInvoice(String id) {
    Invoice invoice = getInvoiceById(id);
    invoiceRepository.delete(invoice);
  }

  public void deleteInvoiceByOrderId(String orderId) {
    List<Invoice> invoices = invoiceRepository.findByOrderId(orderId);
    if (invoices == null || invoices.isEmpty()) {
      return;
    }
    invoiceRepository.deleteAll(invoices);
  }

  public void updateInvoiceTotalByOrderId(String orderId, BigDecimal totalAmount) {
    List<Invoice> invoices = invoiceRepository.findByOrderId(orderId);
    if (invoices == null || invoices.isEmpty()) {
      return;
    }

    for (Invoice invoice : invoices) {
      invoice.setTotalAmount(totalAmount);
    }
    invoiceRepository.saveAll(invoices);
  }
}
