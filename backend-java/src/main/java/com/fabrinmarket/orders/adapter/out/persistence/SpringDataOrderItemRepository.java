package com.fabrinmarket.orders.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface SpringDataOrderItemRepository extends JpaRepository<OrderItemJpaEntity, Integer> {
    List<OrderItemJpaEntity> findByOrderIdOrderByIdAsc(Integer orderId);
}
