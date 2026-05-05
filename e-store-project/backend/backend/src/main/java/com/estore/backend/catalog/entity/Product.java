package com.estore.backend.catalog.entity;

import lombok.Data;
import java.math.BigDecimal;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "products")
public class Product {

    @Id
    private int id;
    private String name;
    private String description;
    private BigDecimal price;
    /**
     * Backward-compatible field used by the frontend to render the product image.
     * We now set this to an internal URL like: /api/products/{id}/image
     */
    private String imageUrl;

    /**
     * The actual image is stored in MongoDB GridFS.
     */
    private String imageFileId;
    private String imageContentType;
    private String imageFilename;
    private Long imageSize;
}
