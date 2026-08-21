package com.fabrinmarket.catalog.domain.model;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ProductPrice(BigDecimal value) {

    private static final BigDecimal MAXIMUM = new BigDecimal("99999999.99");

    public ProductPrice {
        if (value == null || value.signum() <= 0) {
            throw new InvalidProductDataException("O preço do produto deve ser maior que zero.");
        }
        if (value.stripTrailingZeros().scale() > 2) {
            throw new InvalidProductDataException("O preço deve ter no máximo duas casas decimais.");
        }
        if (value.compareTo(MAXIMUM) > 0) {
            throw new InvalidProductDataException("O preço excede o limite permitido.");
        }
        value = value.setScale(2, RoundingMode.UNNECESSARY);
    }
}
