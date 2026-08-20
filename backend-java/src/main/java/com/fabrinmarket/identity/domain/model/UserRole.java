package com.fabrinmarket.identity.domain.model;

import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;

import java.util.Locale;

public enum UserRole {
    CUSTOMER,
    SELLER,
    ADMIN;

    public String value() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static UserRole from(String value) {
        if (value == null || value.isBlank()) {
            return CUSTOMER;
        }

        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new InvalidUserDataException("Role inválida.");
        }
    }
}
