package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;

import java.util.Locale;

public enum StockReservationStatus {
    RESERVED("reserved"),
    CONSUMED("consumed"),
    RELEASED("released");

    private final String value;

    StockReservationStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static StockReservationStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidOrderDataException("O status da reserva é obrigatório.");
        }
        var normalized = value.trim().toLowerCase(Locale.ROOT);
        for (var status : values()) {
            if (status.value.equals(normalized)) {
                return status;
            }
        }
        throw new InvalidOrderDataException("Status de reserva inválido.");
    }
}
