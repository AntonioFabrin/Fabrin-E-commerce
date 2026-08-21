package com.fabrinmarket.orders.application.port.out;

import java.math.BigDecimal;
import java.util.Optional;

public interface OrderProductRepositoryPort {

    Optional<OrderProductSnapshot> findByIdForUpdate(Integer productId);

    boolean decreaseStock(Integer productId, int quantity);

    void increaseStock(Integer productId, int quantity);

    record OrderProductSnapshot(
            Integer id,
            Integer sellerId,
            String name,
            BigDecimal price,
            int stock,
            String imageUrl
    ) {
    }
}
