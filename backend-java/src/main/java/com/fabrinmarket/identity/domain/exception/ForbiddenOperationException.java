package com.fabrinmarket.identity.domain.exception;

public final class ForbiddenOperationException extends IdentityException {
    public ForbiddenOperationException() {
        super("FORBIDDEN_OPERATION", "Você não tem permissão para realizar esta operação.");
    }
}
