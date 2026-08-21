package com.fabrinmarket.orders.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

interface SpringDataStockReservationRepository extends JpaRepository<StockReservationJpaEntity, Long> {
    List<StockReservationJpaEntity> findByOrderIdOrderByIdAsc(Integer orderId);

    Optional<StockReservationJpaEntity> findByOrderIdAndProductId(Integer orderId, Integer productId);
}
