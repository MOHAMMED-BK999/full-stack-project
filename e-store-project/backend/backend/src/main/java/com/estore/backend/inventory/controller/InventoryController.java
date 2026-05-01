package com.estore.backend.inventory.controller;

import com.estore.backend.inventory.dto.InventoryRequest;
import com.estore.backend.inventory.entity.Inventory;
import com.estore.backend.inventory.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:4200")
public class InventoryController {

  private final InventoryService inventoryService;

  public InventoryController(InventoryService inventoryService) {
    this.inventoryService = inventoryService;
  }

  @GetMapping
  public ResponseEntity<List<Inventory>> getAllInventory() {
    return ResponseEntity.ok(inventoryService.getAllInventory());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Inventory> getInventoryById(@PathVariable String id) {
    return ResponseEntity.ok(inventoryService.getInventoryById(id));
  }

  @GetMapping("/product/{productId}")
  public ResponseEntity<Inventory> getInventoryByProductId(@PathVariable int productId) {
    return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<Inventory> createInventory(@RequestBody InventoryRequest request) {
    return ResponseEntity.ok(inventoryService.createInventory(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Inventory> updateInventory(@PathVariable String id, @RequestBody InventoryRequest request) {
    return ResponseEntity.ok(inventoryService.updateInventory(id, request));
  }

  @PutMapping("/stock/{productId}")
  public ResponseEntity<Inventory> updateStock(@PathVariable int productId, @RequestParam int quantity) {
    return ResponseEntity.ok(inventoryService.updateStock(productId, quantity));
  }

  @GetMapping("/low-stock")
  public ResponseEntity<List<Inventory>> getLowStockItems() {
    return ResponseEntity.ok(inventoryService.getLowStockItems());
  }

  @GetMapping("/warehouse/{warehouse}")
  public ResponseEntity<List<Inventory>> getInventoryByWarehouse(@PathVariable String warehouse) {
    return ResponseEntity.ok(inventoryService.getInventoryByWarehouse(warehouse));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteInventory(@PathVariable String id) {
    inventoryService.deleteInventory(id);
  }
}
