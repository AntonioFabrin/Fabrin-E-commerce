package com.fabrinmarket.orders.domain.exception;

public final class OrderForbiddenOperationException extends OrderException {

    public OrderForbiddenOperationException(String message) {
        super(message);
    }
}
