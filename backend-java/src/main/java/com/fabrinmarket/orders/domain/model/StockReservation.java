package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderStateException;

import java.time.LocalDateTime;
import java.util.Objects;

public record StockReservation(
        Long id,
        Integer orderId,
        Integer productId,
        int quantity,
        StockReservationStatus status,
        LocalDateTime createdAt,
        LocalDateTime releasedAt
) {

    public StockReservation {
        if (orderId == null || orderId <= 0 || productId == null || productId <= 0) {
            throw new InvalidOrderDataException("Pedido e produto da reserva são obrigatórios.");
        }
        if (quantity <= 0 || quantity > 1_000_000) {
            throw new InvalidOrderDataException("A quantidade reservada deve estar entre 1 e 1000000.");
        }
        Objects.requireNonNull(status, "status is required");
        Objects.requireNonNull(createdAt, "createdAt is required");
        if (status == StockReservationStatus.RELEASED && releasedAt == null) {
            throw new InvalidOrderDataException("Uma reserva liberada deve registrar quando foi liberada.");
        }
        if (status != StockReservationStatus.RELEASED && releasedAt != null) {
            throw new InvalidOrderDataException("A data de liberação só pode existir em uma reserva liberada.");
        }
    }

    public StockReservation release(LocalDateTime when) {
        if (status == StockReservationStatus.RELEASED) {
            return this;
        }
        if (status != StockReservationStatus.RESERVED) {
            throw new InvalidOrderStateException("Somente reservas ativas podem ser liberadas.");
        }
        return new StockReservation(id, orderId, productId, quantity, StockReservationStatus.RELEASED, createdAt,
                Objects.requireNonNull(when, "when is required"));
    }

    public StockReservation consume() {
        if (status == StockReservationStatus.CONSUMED) {
            return this;
        }
        if (status != StockReservationStatus.RESERVED) {
            throw new InvalidOrderStateException("Somente reservas ativas podem ser consumidas.");
        }
        return new StockReservation(id, orderId, productId, quantity, StockReservationStatus.CONSUMED, createdAt, null);
    }
}
