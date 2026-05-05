package com.estore.backend.shopping.dto;

public class UpdateOrderQuantityRequest {
    private Integer quantity;

    public UpdateOrderQuantityRequest() {}

    public UpdateOrderQuantityRequest(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

