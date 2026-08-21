package com.fabrinmarket.orders.domain.exception;

public abstract class OrderException extends RuntimeException {

    protected OrderException(String message) {
        super(message);
    }
}
