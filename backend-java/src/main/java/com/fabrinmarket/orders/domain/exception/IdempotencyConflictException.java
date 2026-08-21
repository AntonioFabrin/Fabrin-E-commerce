package com.fabrinmarket.orders.domain.exception;

public final class IdempotencyConflictException extends OrderException {

    public IdempotencyConflictException() {
        super("A chave de idempotência já foi usada para um pedido diferente.");
    }
}
