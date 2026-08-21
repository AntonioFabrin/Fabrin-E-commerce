package com.fabrinmarket.orders.domain.exception;

public final class OrderPersistenceConflictException extends OrderException {

    public OrderPersistenceConflictException() {
        super("Não foi possível persistir o pedido devido a um conflito concorrente.");
    }
}
