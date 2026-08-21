package com.fabrinmarket.orders.domain.exception;

public final class InvalidOrderStateException extends OrderException {

    public InvalidOrderStateException(String message) {
        super(message);
    }
}
