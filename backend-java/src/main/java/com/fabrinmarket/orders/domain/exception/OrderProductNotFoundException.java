package com.fabrinmarket.orders.domain.exception;

public final class OrderProductNotFoundException extends OrderException {

    public OrderProductNotFoundException(Integer productId) {
        super("Produto " + productId + " não encontrado.");
    }
}
