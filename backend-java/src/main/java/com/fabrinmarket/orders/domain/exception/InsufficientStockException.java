package com.fabrinmarket.orders.domain.exception;

public final class InsufficientStockException extends OrderException {

    public InsufficientStockException(String productName) {
        super("Estoque insuficiente para '" + productName + "'.");
    }
}
