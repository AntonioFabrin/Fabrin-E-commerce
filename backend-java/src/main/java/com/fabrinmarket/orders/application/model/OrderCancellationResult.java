package com.fabrinmarket.orders.application.model;

import com.fabrinmarket.orders.domain.model.Order;

public record OrderCancellationResult(Integer orderId, String status, boolean replayed) {
    public static OrderCancellationResult from(Order order, boolean replayed) {
        return new OrderCancellationResult(order.id(), order.status().value(), replayed);
    }
}
