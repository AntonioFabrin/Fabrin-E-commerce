package com.fabrinmarket.catalog.application.port.in;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.model.ProductView;

import java.math.BigDecimal;

public interface UpdateProductUseCase {

    ProductView updateProduct(
            Integer actorId,
            Integer productId,
            UpdateProductCommand command,
            ProductImageContent replacementImage
    );

    record UpdateProductCommand(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            Integer categoryId
    ) {
    }
}
