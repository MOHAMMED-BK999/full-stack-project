package com.estore.backend.catalog.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Integer id) {
        super("Product with id " + id + " was not found");
    }
}
