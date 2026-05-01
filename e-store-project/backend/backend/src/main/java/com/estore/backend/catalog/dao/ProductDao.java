package com.estore.backend.catalog.dao;

import com.estore.backend.catalog.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository; // Import MongoDB version
import org.springframework.stereotype.Repository;

@Repository
public interface ProductDao extends MongoRepository<Product,Integer> {

}