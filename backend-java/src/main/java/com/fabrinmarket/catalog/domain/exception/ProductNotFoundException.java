package com.fabrinmarket.catalog.domain.exception;

public final class ProductNotFoundException extends CatalogException {

    public ProductNotFoundException() {
        super("PRODUCT_NOT_FOUND", "Produto não encontrado na nossa loja.");
    }
}
