package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.CatalogForbiddenOperationException;

public enum CatalogActorRole {
    CUSTOMER,
    SELLER,
    ADMIN;

    public static CatalogActorRole from(String value) {
        try {
            return CatalogActorRole.valueOf(value == null ? "" : value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new CatalogForbiddenOperationException();
        }
    }

    public boolean canManageCatalog() {
        return this == SELLER || this == ADMIN;
    }
}
