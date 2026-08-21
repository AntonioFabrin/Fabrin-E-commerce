package com.fabrinmarket.orders.application.port.in;

import com.fabrinmarket.orders.application.model.OrderCancellationResult;

public interface CancelOrderUseCase {
    OrderCancellationResult cancelOrder(Integer buyerId, Integer orderId);
}
