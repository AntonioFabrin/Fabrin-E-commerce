package com.fabrinmarket.identity.domain.exception;

public final class InvalidTokenException extends IdentityException {
    public InvalidTokenException() {
        super("INVALID_TOKEN", "Token inválido ou expirado.");
    }
}
