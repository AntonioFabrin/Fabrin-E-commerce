package com.fabrinmarket.orders.adapter.in.web.dto;

import com.fabrinmarket.orders.application.model.OrderListEntry;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Integer id,
        BigDecimal total,
        String status,
        String external_reference,
        LocalDateTime created_at,
        List<OrderItemResponse> items,
        String payment_method,
        String payment_status,
        String buyer_name,
        String buyer_email
) {
    public static OrderResponse from(OrderListEntry order) {
        return new OrderResponse(
                order.id(), order.total(), order.status(), order.externalReference(), order.createdAt(),
                order.items().stream().map(OrderItemResponse::from).toList(), order.paymentMethod(), order.paymentStatus(),
                order.buyerName(), order.buyerEmail()
        );
    }
}
