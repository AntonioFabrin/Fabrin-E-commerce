package com.fabrinmarket.orders.application.port.out;

import com.fabrinmarket.orders.application.model.OrderListEntry;

import java.util.List;

public interface OrderQueryRepositoryPort {
    List<OrderListEntry> findByBuyerId(Integer buyerId);

    List<OrderListEntry> findBySellerId(Integer sellerId);
}
