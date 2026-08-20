package com.fabrinmarket.identity.domain.model;

import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;

import java.util.Locale;
import java.util.regex.Pattern;

public record EmailAddress(String value) {

    private static final Pattern FORMAT = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public EmailAddress {
        if (value == null) {
            throw new InvalidUserDataException("E-mail é obrigatório.");
        }

        value = value.trim().toLowerCase(Locale.ROOT);
        if (value.length() > 255 || !FORMAT.matcher(value).matches()) {
            throw new InvalidUserDataException("Formato de e-mail inválido.");
        }
    }
}
