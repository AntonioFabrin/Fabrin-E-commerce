package com.fabrinmarket.orders.adapter.in.web.dto;

import com.fabrinmarket.orders.application.model.OrderListItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Integer product_id,
        String product_name,
        Integer quantity,
        BigDecimal price,
        String image_url
) {
    static OrderItemResponse from(OrderListItem item) {
        return new OrderItemResponse(item.productId(), item.productName(), item.quantity(), item.price(), item.imageUrl());
    }
}
