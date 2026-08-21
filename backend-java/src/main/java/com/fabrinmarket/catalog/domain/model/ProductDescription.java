package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;

public record ProductDescription(String value) {

    private static final int MAX_LENGTH = 5_000;

    public ProductDescription {
        value = value == null ? "" : value.trim();
        if (value.length() > MAX_LENGTH) {
            throw new InvalidProductDataException("A descrição deve ter no máximo 5000 caracteres.");
        }
    }
}
