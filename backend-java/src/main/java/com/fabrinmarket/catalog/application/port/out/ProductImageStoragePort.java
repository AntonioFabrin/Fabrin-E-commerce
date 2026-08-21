package com.fabrinmarket.catalog.application.port.out;

import com.fabrinmarket.catalog.application.model.ProductImageContent;

public interface ProductImageStoragePort {

    String store(Integer sellerId, ProductImageContent image);

    void delete(String imageUrl);
}
