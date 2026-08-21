package com.fabrinmarket.orders.domain.exception;

public final class OrderNotFoundException extends OrderException {

    public OrderNotFoundException(Integer orderId) {
        super("Pedido " + orderId + " não encontrado.");
    }
}
