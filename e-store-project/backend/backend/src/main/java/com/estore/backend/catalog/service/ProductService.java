package com.estore.backend.catalog.service;

import com.estore.backend.catalog.dao.ProductDao;
import com.estore.backend.catalog.dto.ProductRequest;
import com.estore.backend.catalog.entity.Product;
import com.estore.backend.catalog.exception.ProductNotFoundException;
import java.util.List;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductService {

    private final ProductDao productDao;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final ProductImageService productImageService;

    public ProductService(
            ProductDao productDao,
            SequenceGeneratorService sequenceGeneratorService,
            ProductImageService productImageService
    ) {
        this.productDao = productDao;
        this.sequenceGeneratorService = sequenceGeneratorService;
        this.productImageService = productImageService;
    }

    public List<Product> getAllProducts() {
        return productDao.findAll();
    }

    public Product getProductById(int id) {
        return productDao.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public GridFsResource getProductImage(int id) {
        Product product = getProductById(id);
        return productImageService.getResource(product.getImageFileId());
    }

    public Product uploadProductImage(int id, MultipartFile imageFile) {
        Product product = getProductById(id);
        ProductImageService.StoredImage storedImage = productImageService.store(imageFile);

        if (product.getImageFileId() != null && !product.getImageFileId().equals(storedImage.fileId())) {
            productImageService.deleteIfExists(product.getImageFileId());
        }

        product.setImageFileId(storedImage.fileId());
        product.setImageContentType(storedImage.contentType());
        product.setImageFilename(storedImage.filename());
        product.setImageSize(storedImage.size());
        product.setImageUrl("/api/products/" + product.getId() + "/image");

        @SuppressWarnings("null")
        Product saved = productDao.save(product);
        return saved;
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
        productImageService.deleteIfExists(product.getImageFileId());
        productDao.delete(product);
    }

    private void applyChanges(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description() == null ? null : request.description().trim());
        product.setPrice(request.price());
        // Backward compatible: request.image is still a URL string, but we now "stock" the image
        // in MongoDB (GridFS) and serve it from our own endpoint.
        ProductImageService.StoredImage storedImage = productImageService.storeFromUrl(request.image().trim());

        // Replace old image (if any) to avoid leaking files in GridFS.
        if (product.getImageFileId() != null && !product.getImageFileId().equals(storedImage.fileId())) {
            productImageService.deleteIfExists(product.getImageFileId());
        }

        product.setImageFileId(storedImage.fileId());
        product.setImageContentType(storedImage.contentType());
        product.setImageFilename(storedImage.filename());
        product.setImageSize(storedImage.size());
        product.setImageUrl("/api/products/" + product.getId() + "/image");
    }
}
