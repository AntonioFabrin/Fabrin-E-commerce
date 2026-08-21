package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;

import java.util.Locale;
import java.util.UUID;

public record OrderReference(String value) {

    private static final int MAXIMUM_LENGTH = 64;

    public OrderReference {
        if (value == null || value.isBlank()) {
            throw new InvalidOrderDataException("A referência do pedido é obrigatória.");
        }
        value = value.trim().toUpperCase(Locale.ROOT);
        if (value.length() > MAXIMUM_LENGTH || !value.matches("[A-Z0-9-]+")) {
            throw new InvalidOrderDataException("A referência do pedido é inválida.");
        }
    }

    public static OrderReference newReference() {
        return new OrderReference("ORD-" + UUID.randomUUID());
    }
}
