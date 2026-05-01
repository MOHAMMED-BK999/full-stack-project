package com.estore.backend.billing.controller;

import com.estore.backend.billing.dto.InvoiceRequest;
import com.estore.backend.billing.entity.Invoice;
import com.estore.backend.billing.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:4200")
public class InvoiceController {

  private final InvoiceService invoiceService;

  public InvoiceController(InvoiceService invoiceService) {
    this.invoiceService = invoiceService;
  }

  @GetMapping
  public ResponseEntity<List<Invoice>> getAllInvoices() {
    return ResponseEntity.ok(invoiceService.getAllInvoices());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Invoice> getInvoiceById(@PathVariable String id) {
    return ResponseEntity.ok(invoiceService.getInvoiceById(id));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<Invoice> createInvoice(@RequestBody InvoiceRequest request) {
    return ResponseEntity.ok(invoiceService.createInvoice(request));
  }

  @PutMapping("/{id}/mark-paid")
  public ResponseEntity<Invoice> markAsPaid(@PathVariable String id) {
    return ResponseEntity.ok(invoiceService.markAsPaid(id));
  }

  @GetMapping("/customer/{customerId}")
  public ResponseEntity<List<Invoice>> getInvoicesByCustomerId(@PathVariable String customerId) {
    return ResponseEntity.ok(invoiceService.getInvoicesByCustomerId(customerId));
  }

  @GetMapping("/status/{status}")
  public ResponseEntity<List<Invoice>> getInvoicesByStatus(@PathVariable String status) {
    return ResponseEntity.ok(invoiceService.getInvoicesByPaymentStatus(status));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteInvoice(@PathVariable String id) {
    invoiceService.deleteInvoice(id);
  }
}
