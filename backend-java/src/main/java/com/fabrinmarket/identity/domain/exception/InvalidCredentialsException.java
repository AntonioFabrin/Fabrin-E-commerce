package com.fabrinmarket.identity.domain.exception;

public final class InvalidCredentialsException extends IdentityException {
    public InvalidCredentialsException() {
        super("INVALID_CREDENTIALS", "Credenciais inválidas.");
    }
}
