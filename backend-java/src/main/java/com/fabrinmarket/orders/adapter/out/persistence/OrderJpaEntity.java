package com.fabrinmarket.orders.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
class OrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer buyerId;

    @Column(nullable = false, length = 64, unique = true)
    private String reference;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected OrderJpaEntity() {
    }

    OrderJpaEntity(Integer buyerId, String reference, BigDecimal total, String status, String idempotencyKey, LocalDateTime createdAt) {
        this.buyerId = buyerId;
        this.reference = reference;
        this.total = total;
        this.status = status;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
    }

    void updateStatus(String updatedStatus) {
        this.status = updatedStatus;
    }

    Integer getId() { return id; }
    Integer getBuyerId() { return buyerId; }
    String getReference() { return reference; }
    BigDecimal getTotal() { return total; }
    String getStatus() { return status; }
    String getIdempotencyKey() { return idempotencyKey; }
    LocalDateTime getCreatedAt() { return createdAt; }
}
