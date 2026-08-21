package com.fabrinmarket.catalog.application.port.in;

import com.fabrinmarket.catalog.application.model.ProductImageContent;

import java.math.BigDecimal;

public interface CreateProductUseCase {

    Integer createProduct(Integer actorId, CreateProductCommand command, ProductImageContent image);

    record CreateProductCommand(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Integer categoryId
    ) {
    }
}
