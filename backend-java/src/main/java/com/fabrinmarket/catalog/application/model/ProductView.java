package com.fabrinmarket.catalog.application.model;

import com.fabrinmarket.catalog.domain.model.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductView(
        Integer id,
        Integer sellerId,
        String name,
        String description,
        BigDecimal price,
        int stock,
        Integer categoryId,
        String imageUrl,
        LocalDateTime createdAt
) {
    public static ProductView from(Product product) {
        return new ProductView(
                product.id(),
                product.sellerId(),
                product.name().value(),
                product.description().value(),
                product.price().value(),
                product.stock().value(),
                product.categoryId(),
                product.imageUrl(),
                product.createdAt()
        );
    }
}
