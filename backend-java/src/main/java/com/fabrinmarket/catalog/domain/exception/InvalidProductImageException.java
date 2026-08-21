package com.fabrinmarket.catalog.domain.exception;

public final class InvalidProductImageException extends CatalogException {

    public InvalidProductImageException(String message) {
        super("INVALID_PRODUCT_IMAGE", message);
    }
}
