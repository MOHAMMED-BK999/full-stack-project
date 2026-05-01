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
    private String imageUrl;
}
