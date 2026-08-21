package com.fabrinmarket.orders.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface SpringDataOrderRepository extends JpaRepository<OrderJpaEntity, Integer> {
    Optional<OrderJpaEntity> findByBuyerIdAndIdempotencyKey(Integer buyerId, String idempotencyKey);
}
