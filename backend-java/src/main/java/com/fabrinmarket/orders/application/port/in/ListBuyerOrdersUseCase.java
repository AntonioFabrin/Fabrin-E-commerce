package com.fabrinmarket.orders.application.port.in;

import com.fabrinmarket.orders.application.model.OrderListEntry;

import java.util.List;

public interface ListBuyerOrdersUseCase {
    List<OrderListEntry> listBuyerOrders(Integer buyerId);
}
