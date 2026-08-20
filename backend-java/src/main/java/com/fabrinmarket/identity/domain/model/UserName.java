package com.fabrinmarket.identity.domain.model;

import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;

public record UserName(String value) {

    public UserName {
        if (value == null) {
            throw new InvalidUserDataException("Nome é obrigatório.");
        }

        value = value.trim();
        if (value.length() < 3 || value.length() > 255) {
            throw new InvalidUserDataException("O nome deve ter entre 3 e 255 caracteres.");
        }
    }
}
