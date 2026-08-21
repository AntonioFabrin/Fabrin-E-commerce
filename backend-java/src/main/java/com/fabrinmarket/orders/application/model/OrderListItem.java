package com.fabrinmarket.orders.application.model;

import java.math.BigDecimal;

public record OrderListItem(
        Integer productId,
        String productName,
        Integer quantity,
        BigDecimal price,
        String imageUrl
) {
}
