package com.fabrinmarket.orders.application.port.out;

import com.fabrinmarket.orders.domain.model.Order;

import java.util.Optional;

public interface OrderRepositoryPort {

    Order save(Order order);

    Optional<Order> findByBuyerIdAndIdempotencyKey(Integer buyerId, String idempotencyKey);

    Optional<Order> findById(Integer orderId);
}
