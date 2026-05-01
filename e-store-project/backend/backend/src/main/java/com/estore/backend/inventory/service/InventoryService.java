package com.estore.backend.inventory.service;

import com.estore.backend.inventory.dto.InventoryRequest;
import com.estore.backend.inventory.entity.Inventory;
import com.estore.backend.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryService {

  private final InventoryRepository inventoryRepository;

  public InventoryService(InventoryRepository inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  public List<Inventory> getAllInventory() {
    return inventoryRepository.findAll();
  }

  public Inventory getInventoryById(String id) {
    return inventoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + id));
  }

  public Inventory getInventoryByProductId(int productId) {
    return inventoryRepository.findByProductId(productId)
        .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
  }

  public Inventory createInventory(InventoryRequest request) {
    if (inventoryRepository.findByProductId(request.productId()).isPresent()) {
      throw new RuntimeException("Inventory already exists for product id: " + request.productId());
    }
    Inventory inventory = new Inventory();
    inventory.setProductId(request.productId());
    inventory.setProductName(request.productName());
    inventory.setQuantityOnHand(request.quantityOnHand());
    inventory.setReorderLevel(request.reorderLevel());
    inventory.setReorderQuantity(request.reorderQuantity());
    inventory.setWarehouse(request.warehouse());
    return inventoryRepository.save(inventory);
  }

  public Inventory updateInventory(String id, InventoryRequest request) {
    Inventory inventory = getInventoryById(id);
    inventory.setProductName(request.productName());
    inventory.setQuantityOnHand(request.quantityOnHand());
    inventory.setReorderLevel(request.reorderLevel());
    inventory.setReorderQuantity(request.reorderQuantity());
    inventory.setWarehouse(request.warehouse());
    return inventoryRepository.save(inventory);
  }

  public Inventory updateStock(int productId, int quantity) {
    Inventory inventory = getInventoryByProductId(productId);
    inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
    return inventoryRepository.save(inventory);
  }

  public List<Inventory> getLowStockItems() {
    return inventoryRepository.findAll().stream()
        .filter(inv -> inv.getQuantityOnHand() <= inv.getReorderLevel())
        .toList();
  }

  public List<Inventory> getInventoryByWarehouse(String warehouse) {
    return inventoryRepository.findByWarehouse(warehouse);
  }

  public void deleteInventory(String id) {
    Inventory inventory = getInventoryById(id);
    inventoryRepository.delete(inventory);
  }
}
