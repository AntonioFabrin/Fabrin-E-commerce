package com.fabrinmarket.orders.application.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderListEntry(
        Integer id,
        BigDecimal total,
        String status,
        String externalReference,
        LocalDateTime createdAt,
        List<OrderListItem> items,
        String paymentMethod,
        String paymentStatus,
        String buyerName,
        String buyerEmail
) {
    public OrderListEntry {
        items = List.copyOf(items);
    }
}
