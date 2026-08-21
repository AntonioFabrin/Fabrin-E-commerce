package com.fabrinmarket.catalog.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
class ProductJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected ProductJpaEntity() {
    }

    ProductJpaEntity(
            Integer id,
            Integer sellerId,
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Integer categoryId,
            String imageUrl,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.sellerId = sellerId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    void apply(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Integer categoryId,
            String imageUrl
    ) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
    }

    Integer getId() {
        return id;
    }

    Integer getSellerId() {
        return sellerId;
    }

    String getName() {
        return name;
    }

    String getDescription() {
        return description;
    }

    BigDecimal getPrice() {
        return price;
    }

    Integer getStock() {
        return stock;
    }

    Integer getCategoryId() {
        return categoryId;
    }

    String getImageUrl() {
        return imageUrl;
    }

    LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
