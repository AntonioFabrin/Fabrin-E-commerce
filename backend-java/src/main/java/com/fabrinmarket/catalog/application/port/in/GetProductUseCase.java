package com.fabrinmarket.catalog.application.port.in;

import com.fabrinmarket.catalog.application.model.ProductView;

public interface GetProductUseCase {
    ProductView getProduct(Integer productId);
}
