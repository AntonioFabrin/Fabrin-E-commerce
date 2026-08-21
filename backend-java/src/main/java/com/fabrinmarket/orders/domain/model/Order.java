package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderStateException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public record Order(
        Integer id,
        OrderReference reference,
        Integer buyerId,
        List<OrderItem> items,
        Money total,
        OrderStatus status,
        String idempotencyKey,
        LocalDateTime createdAt
) {

    public Order {
        Objects.requireNonNull(reference, "reference is required");
        if (buyerId == null || buyerId <= 0) {
            throw new InvalidOrderDataException("O comprador do pedido é obrigatório.");
        }
        if (items == null || items.isEmpty()) {
            throw new InvalidOrderDataException("O pedido deve ter pelo menos um item.");
        }
        items = List.copyOf(items);
        Objects.requireNonNull(total, "total is required");
        var calculatedTotal = items.stream().map(OrderItem::subtotal).reduce(new Money(java.math.BigDecimal.ZERO), Money::plus);
        if (calculatedTotal.value().compareTo(total.value()) != 0) {
            throw new InvalidOrderDataException("O total do pedido não confere com seus itens.");
        }
        Objects.requireNonNull(status, "status is required");
        idempotencyKey = normalizeIdempotencyKey(idempotencyKey);
        Objects.requireNonNull(createdAt, "createdAt is required");
    }

    public Order cancel() {
        if (status == OrderStatus.CANCELLED) {
            return this;
        }
        if (status != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Somente pedidos pendentes podem ser cancelados.");
        }
        return new Order(id, reference, buyerId, items, total, OrderStatus.CANCELLED, idempotencyKey, createdAt);
    }

    public Order markPaid() {
        if (status == OrderStatus.PAID) {
            return this;
        }
        if (status != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Não é possível pagar um pedido cancelado.");
        }
        return new Order(id, reference, buyerId, items, total, OrderStatus.PAID, idempotencyKey, createdAt);
    }

    private static String normalizeIdempotencyKey(String key) {
        if (key == null || key.isBlank()) {
            throw new InvalidOrderDataException("A chave de idempotência é obrigatória.");
        }
        var normalized = key.trim();
        if (normalized.length() > 128) {
            throw new InvalidOrderDataException("A chave de idempotência excede o limite permitido.");
        }
        return normalized;
    }
}
