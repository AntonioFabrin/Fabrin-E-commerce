package com.fabrinmarket.identity.domain.model;

import java.util.Objects;

public record IdentityActor(Integer userId, UserRole tokenRole) {

    public IdentityActor {
        Objects.requireNonNull(userId, "userId is required");
        Objects.requireNonNull(tokenRole, "tokenRole is required");
    }
}
