package com.fabrinmarket.identity.domain.exception;

public final class InvalidUserDataException extends IdentityException {
    public InvalidUserDataException(String message) {
        super("INVALID_USER_DATA", message);
    }
}
