package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;

import java.util.Objects;

public record OrderItem(Integer productId, int quantity, Money unitPrice) {

    public OrderItem {
        if (productId == null || productId <= 0) {
            throw new InvalidOrderDataException("O produto do item é obrigatório.");
        }
        if (quantity <= 0 || quantity > 1_000_000) {
            throw new InvalidOrderDataException("A quantidade do item deve estar entre 1 e 1000000.");
        }
        Objects.requireNonNull(unitPrice, "unitPrice is required");
        if (unitPrice.value().signum() <= 0) {
            throw new InvalidOrderDataException("O preço unitário deve ser maior que zero.");
        }
    }

    public Money subtotal() {
        return unitPrice.times(quantity);
    }
}
