package com.estore.backend.catalog.controller;

import com.estore.backend.catalog.dto.ProductRequest;
import com.estore.backend.catalog.entity.Product;
import com.estore.backend.catalog.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.estore.backend.security.AdminAccessService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class ProductController {

    private final ProductService productService;
    private final AdminAccessService adminAccessService;

    public ProductController(ProductService productService, AdminAccessService adminAccessService) {
        this.productService = productService;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable int id) {
        return productService.getProductById(id);
    }

    @GetMapping(value = "/{id}/image")
    public ResponseEntity<Resource> getProductImage(@PathVariable int id) {
        var res = productService.getProductImage(id);
        String contentType = res.getContentType();
        MediaType mt = (contentType == null || contentType.isBlank())
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(contentType);
        return ResponseEntity.ok().contentType(mt).body(res);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product uploadProductImage(
            @PathVariable int id,
            @RequestHeader(value = AdminAccessService.ADMIN_EMAIL_HEADER, required = false) String userEmail,
            @RequestPart("image") MultipartFile image) {
        adminAccessService.assertAdmin(userEmail);
        return productService.uploadProductImage(id, image);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(
            @RequestHeader(value = AdminAccessService.ADMIN_EMAIL_HEADER, required = false) String userEmail,
            @Valid @RequestBody ProductRequest request) {
        adminAccessService.assertAdmin(userEmail);
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable int id,
            @RequestHeader(value = AdminAccessService.ADMIN_EMAIL_HEADER, required = false) String userEmail,
            @Valid @RequestBody ProductRequest request) {
        adminAccessService.assertAdmin(userEmail);
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable int id,
            @RequestHeader(value = AdminAccessService.ADMIN_EMAIL_HEADER, required = false) String userEmail) {
        adminAccessService.assertAdmin(userEmail);
        productService.deleteProduct(id);
    }
}
