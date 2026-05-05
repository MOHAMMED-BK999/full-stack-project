package com.estore.backend.customer.service;

import com.estore.backend.catalog.service.SequenceGeneratorService;
import com.estore.backend.customer.dto.UpdateCustomerRequest;
import com.estore.backend.customer.entity.Customer;
import com.estore.backend.customer.repository.CustomerRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final CustomerRepository repository;
    private final SequenceGeneratorService sequenceGeneratorService;

    public CustomerService(CustomerRepository repository, SequenceGeneratorService sequenceGeneratorService) {
        this.repository = repository;
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    public Customer registerCustomer(Customer customer) {
        if (repository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }
        customer.setId(sequenceGeneratorService.generateSequence("customers_sequence"));
        return repository.save(customer);
    }

    public Customer getCustomerByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer updateCustomerByEmail(String email, UpdateCustomerRequest request) {
        Customer customer = getCustomerByEmail(email);

        if (request.getFirstName() != null) {
            customer.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName().trim());
        }
        if (request.getPhoneNumber() != null) {
            String phone = request.getPhoneNumber().trim();
            customer.setPhoneNumber(phone.isBlank() ? null : phone);
        }
        if (request.getAddress() != null) {
            String addr = request.getAddress().trim();
            customer.setAddress(addr.isBlank() ? null : addr);
        }

        return repository.save(customer);
    }
}
