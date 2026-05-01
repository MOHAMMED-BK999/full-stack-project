package com.estore.backend.catalog.service;

import com.estore.backend.catalog.dao.ProductDao;
import com.estore.backend.catalog.dto.ProductRequest;
import com.estore.backend.catalog.entity.Product;
import com.estore.backend.catalog.exception.ProductNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductDao productDao;
    private final SequenceGeneratorService sequenceGeneratorService;

    public ProductService(ProductDao productDao, SequenceGeneratorService sequenceGeneratorService) {
        this.productDao = productDao;
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    public List<Product> getAllProducts() {
        return productDao.findAll();
    }

    public Product getProductById(int id) {
        return productDao.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        product.setId(sequenceGeneratorService.generateSequence("products_sequence"));
        applyChanges(product, request);
        @SuppressWarnings("null")
        Product result = productDao.save(product);
        return result;
    }

    @SuppressWarnings("null")
    public Product updateProduct(Integer id, ProductRequest request) {
        Product product = getProductById(id);
        applyChanges(product, request);
        return productDao.save(product);
    }

    @SuppressWarnings("null")
    public void deleteProduct(Integer id) {
        Product product = getProductById(id);
        productDao.delete(product);
    }

    private void applyChanges(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description() == null ? null : request.description().trim());
        product.setPrice(request.price());
        product.setImageUrl(request.image().trim());
    }
}
