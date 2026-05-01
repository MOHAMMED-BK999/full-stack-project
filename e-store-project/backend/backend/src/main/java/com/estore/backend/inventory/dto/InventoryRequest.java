package com.estore.backend.inventory.dto;

public record InventoryRequest(
    int productId,
    String productName,
    int quantityOnHand,
    int reorderLevel,
    int reorderQuantity,
    String warehouse) {
}
