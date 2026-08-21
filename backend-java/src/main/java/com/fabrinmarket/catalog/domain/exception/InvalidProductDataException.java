package com.fabrinmarket.catalog.domain.exception;

public final class InvalidProductDataException extends CatalogException {

    public InvalidProductDataException(String message) {
        super("INVALID_PRODUCT_DATA", message);
    }
}
