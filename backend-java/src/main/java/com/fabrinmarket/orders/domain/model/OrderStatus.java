package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;

import java.util.Locale;

public enum OrderStatus {
    PENDING("pending"),
    PAID("paid"),
    CANCELLED("cancelled");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static OrderStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidOrderDataException("O status do pedido é obrigatório.");
        }
        var normalized = value.trim().toLowerCase(Locale.ROOT);
        for (var status : values()) {
            if (status.value.equals(normalized)) {
                return status;
            }
        }
        throw new InvalidOrderDataException("Status de pedido inválido.");
    }
}
