package com.fabrinmarket.catalog.application.port.in;

import com.fabrinmarket.catalog.application.model.ProductView;

import java.util.List;

public interface ListOwnProductsUseCase {
    List<ProductView> listOwnProducts(Integer actorId);
}
