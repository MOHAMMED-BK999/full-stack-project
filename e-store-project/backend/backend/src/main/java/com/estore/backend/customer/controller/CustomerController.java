package com.estore.backend.customer.controller;

import com.estore.backend.customer.entity.Customer;
import com.estore.backend.customer.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:4200")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<Customer> register(@RequestBody Customer customer) {
        return ResponseEntity.ok(service.registerCustomer(customer));
    }

    @GetMapping("/{email}")
    public ResponseEntity<Customer> getProfile(@PathVariable String email) {
        return ResponseEntity.ok(service.getCustomerByEmail(email));
    }

    @GetMapping
    public List<Customer> listAll() {
        return service.getAllCustomers();
    }
}