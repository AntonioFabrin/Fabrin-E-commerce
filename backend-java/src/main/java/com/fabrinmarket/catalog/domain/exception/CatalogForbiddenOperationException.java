package com.fabrinmarket.catalog.domain.exception;

public final class CatalogForbiddenOperationException extends CatalogException {

    public CatalogForbiddenOperationException() {
        super("CATALOG_ACCESS_DENIED", "Você não tem permissão para gerenciar este produto.");
    }
}
