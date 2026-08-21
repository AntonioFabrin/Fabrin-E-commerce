package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;

public record ProductStock(int value) {

    private static final int MAXIMUM = 1_000_000;

    public ProductStock {
        if (value < 0 || value > MAXIMUM) {
            throw new InvalidProductDataException("O estoque deve estar entre 0 e 1000000.");
        }
    }
}
