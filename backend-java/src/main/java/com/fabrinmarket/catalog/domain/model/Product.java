package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;

import java.time.LocalDateTime;
import java.util.Objects;

public record Product(
        Integer id,
        Integer sellerId,
        ProductName name,
        ProductDescription description,
        ProductPrice price,
        ProductStock stock,
        Integer categoryId,
        String imageUrl,
        LocalDateTime createdAt
) {

    public Product {
        if (sellerId == null || sellerId <= 0) {
            throw new InvalidProductDataException("O vendedor do produto é obrigatório.");
        }
        Objects.requireNonNull(name, "name is required");
        Objects.requireNonNull(description, "description is required");
        Objects.requireNonNull(price, "price is required");
        Objects.requireNonNull(stock, "stock is required");
        if (categoryId == null || categoryId <= 0) {
            throw new InvalidProductDataException("A categoria deve ser um inteiro positivo.");
        }
        imageUrl = imageUrl == null ? "" : imageUrl.trim();
        Objects.requireNonNull(createdAt, "createdAt is required");
    }

    public Product withId(Integer assignedId) {
        return new Product(assignedId, sellerId, name, description, price, stock, categoryId, imageUrl, createdAt);
    }

    public Product withDetails(
            ProductName updatedName,
            ProductDescription updatedDescription,
            ProductPrice updatedPrice,
            ProductStock updatedStock,
            Integer updatedCategoryId
    ) {
        return new Product(id, sellerId, updatedName, updatedDescription, updatedPrice, updatedStock,
                updatedCategoryId, imageUrl, createdAt);
    }

    public Product withImageUrl(String updatedImageUrl) {
        return new Product(id, sellerId, name, description, price, stock, categoryId, updatedImageUrl, createdAt);
    }
}
