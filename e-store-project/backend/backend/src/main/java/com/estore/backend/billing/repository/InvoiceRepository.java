package com.estore.backend.billing.repository;

import com.estore.backend.billing.entity.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
  List<Invoice> findByCustomerId(String customerId);

  List<Invoice> findByPaymentStatus(String paymentStatus);

  List<Invoice> findByOrderId(String orderId);
}
