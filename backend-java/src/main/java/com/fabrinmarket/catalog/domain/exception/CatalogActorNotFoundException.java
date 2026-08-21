package com.fabrinmarket.catalog.domain.exception;

public final class CatalogActorNotFoundException extends CatalogException {

    public CatalogActorNotFoundException() {
        super("CATALOG_ACTOR_NOT_FOUND", "Usuário autenticado não encontrado.");
    }
}
