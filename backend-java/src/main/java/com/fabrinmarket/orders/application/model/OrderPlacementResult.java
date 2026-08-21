package com.fabrinmarket.orders.application.model;

import com.fabrinmarket.orders.domain.model.Order;

import java.math.BigDecimal;

public record OrderPlacementResult(
        Integer orderId,
        String reference,
        BigDecimal total,
        String status,
        boolean replayed
) {

    public static OrderPlacementResult from(Order order, boolean replayed) {
        return new OrderPlacementResult(
                order.id(), order.reference().value(), order.total().value(), order.status().value(), replayed
        );
    }
}
