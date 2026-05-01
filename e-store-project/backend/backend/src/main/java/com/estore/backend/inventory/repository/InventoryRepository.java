package com.estore.backend.inventory.repository;

import com.estore.backend.inventory.entity.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
  Optional<Inventory> findByProductId(int productId);

  List<Inventory> findByWarehouse(String warehouse);

  List<Inventory> findByQuantityOnHandLessThan(int reorderLevel);
}
