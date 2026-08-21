package com.fabrinmarket.orders.application.port.in;

import com.fabrinmarket.orders.application.model.OrderPlacementResult;

import java.util.List;

public interface PlaceOrderUseCase {

    OrderPlacementResult placeOrder(Integer buyerId, PlaceOrderCommand command, String idempotencyKey);

    record PlaceOrderCommand(List<RequestedItem> items) {
        public PlaceOrderCommand {
            items = items == null ? List.of() : List.copyOf(items);
        }
    }

    record RequestedItem(Integer productId, Integer quantity) {
    }
}
