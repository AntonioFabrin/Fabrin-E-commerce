package com.fabrinmarket.catalog.application.port.in;

public interface DeleteProductUseCase {
    void deleteProduct(Integer actorId, Integer productId);
}
