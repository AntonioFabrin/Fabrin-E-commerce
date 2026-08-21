package com.fabrinmarket.orders.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_reservations")
class StockReservationJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 16)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    protected StockReservationJpaEntity() {
    }

    StockReservationJpaEntity(
            Integer orderId,
            Integer productId,
            Integer quantity,
            String status,
            LocalDateTime createdAt,
            LocalDateTime releasedAt
    ) {
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.status = status;
        this.createdAt = createdAt;
        this.releasedAt = releasedAt;
    }

    void apply(String updatedStatus, LocalDateTime updatedReleasedAt) {
        this.status = updatedStatus;
        this.releasedAt = updatedReleasedAt;
    }

    Long getId() { return id; }
    Integer getOrderId() { return orderId; }
    Integer getProductId() { return productId; }
    Integer getQuantity() { return quantity; }
    String getStatus() { return status; }
    LocalDateTime getCreatedAt() { return createdAt; }
    LocalDateTime getReleasedAt() { return releasedAt; }
}
