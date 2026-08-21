package com.fabrinmarket.catalog.application.port.out;

import com.fabrinmarket.catalog.domain.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepositoryPort {

    Product save(Product product);

    Optional<Product> findById(Integer id);

    ProductSlice findPage(int page, int limit);

    List<Product> findBySellerId(Integer sellerId);

    void deleteById(Integer id);

    record ProductSlice(List<Product> items, long totalItems) {
        public ProductSlice {
            items = List.copyOf(items);
        }
    }
}
