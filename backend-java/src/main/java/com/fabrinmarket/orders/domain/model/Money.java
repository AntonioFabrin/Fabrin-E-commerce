package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record Money(BigDecimal value) {

    private static final BigDecimal MAXIMUM = new BigDecimal("99999999.99");

    public Money {
        if (value == null || value.signum() < 0) {
            throw new InvalidOrderDataException("O valor monetário não pode ser negativo.");
        }
        if (value.stripTrailingZeros().scale() > 2 || value.compareTo(MAXIMUM) > 0) {
            throw new InvalidOrderDataException("O valor monetário é inválido.");
        }
        value = value.setScale(2, RoundingMode.UNNECESSARY);
    }

    public static Money unitPrice(BigDecimal value) {
        var money = new Money(value);
        if (money.value.signum() <= 0) {
            throw new InvalidOrderDataException("O preço unitário deve ser maior que zero.");
        }
        return money;
    }

    public Money times(int quantity) {
        if (quantity <= 0) {
            throw new InvalidOrderDataException("A quantidade deve ser positiva.");
        }
        return new Money(value.multiply(BigDecimal.valueOf(quantity)));
    }

    public Money plus(Money other) {
        return new Money(value.add(other.value));
    }
}
