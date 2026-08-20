package com.fabrinmarket.identity.domain.exception;

public abstract class IdentityException extends RuntimeException {

    private final String code;

    protected IdentityException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
