package com.fabrinmarket.catalog.domain.exception;

public abstract class CatalogException extends RuntimeException {

    private final String code;

    protected CatalogException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
