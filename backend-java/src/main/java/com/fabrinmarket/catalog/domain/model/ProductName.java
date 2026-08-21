package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;

public record ProductName(String value) {

    public ProductName {
        if (value == null) {
            throw new InvalidProductDataException("O nome do produto é obrigatório.");
        }
        value = value.trim().replaceAll("\\s+", " ");
        if (value.length() < 3 || value.length() > 255) {
            throw new InvalidProductDataException("O nome do produto deve ter entre 3 e 255 caracteres.");
        }
    }
}
