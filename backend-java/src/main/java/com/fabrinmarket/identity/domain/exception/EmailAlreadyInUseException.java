package com.fabrinmarket.identity.domain.exception;

public final class EmailAlreadyInUseException extends IdentityException {
    public EmailAlreadyInUseException() {
        super("EMAIL_ALREADY_IN_USE", "Este e-mail já está em uso.");
    }
}
