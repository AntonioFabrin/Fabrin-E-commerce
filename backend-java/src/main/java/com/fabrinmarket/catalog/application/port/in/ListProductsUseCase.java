package com.fabrinmarket.catalog.application.port.in;

import com.fabrinmarket.catalog.application.model.ProductPage;

public interface ListProductsUseCase {
    ProductPage listProducts(int page, int limit);
}
