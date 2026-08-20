package com.fabrinmarket.identity.domain.exception;

public final class UserNotFoundException extends IdentityException {
    public UserNotFoundException() {
        super("USER_NOT_FOUND", "Usuário não encontrado.");
    }
}
