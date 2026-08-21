package com.fabrinmarket.catalog.domain.exception;

public final class ProductImageStorageException extends CatalogException {

    public ProductImageStorageException(String message) {
        super("PRODUCT_IMAGE_STORAGE_UNAVAILABLE", message);
    }
}
