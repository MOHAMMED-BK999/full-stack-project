package com.estore.backend.inventory.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventory")
public class Inventory {
  @Id
  private String id;
  private int productId;
  private String productName;
  private int quantityOnHand;
  private int reorderLevel;
  private int reorderQuantity;
  private String warehouse;
}
