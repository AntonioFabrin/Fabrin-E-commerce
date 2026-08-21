package com.fabrinmarket.catalog.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fabrinmarket.catalog.application.model.ProductView;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Integer id,
        @JsonProperty("seller_id") Integer sellerId,
        String name,
        String description,
        BigDecimal price,
        int stock,
        @JsonProperty("category_id") Integer categoryId,
        @JsonProperty("image_url") String imageUrl,
        @JsonProperty("created_at") LocalDateTime createdAt
) {
    public static ProductResponse from(ProductView product) {
        return new ProductResponse(
                product.id(),
                product.sellerId(),
                product.name(),
                product.description(),
                product.price(),
                product.stock(),
                product.categoryId(),
                product.imageUrl(),
                product.createdAt()
        );
    }
}
