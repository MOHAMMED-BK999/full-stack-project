package com.estore.backend.catalog.repository;

import com.estore.backend.catalog.entity.Product;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, Integer> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
