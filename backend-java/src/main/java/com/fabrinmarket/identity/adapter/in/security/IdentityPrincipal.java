package com.fabrinmarket.identity.adapter.in.security;

import com.fabrinmarket.identity.domain.model.IdentityActor;
import com.fabrinmarket.identity.domain.model.UserRole;

public record IdentityPrincipal(Integer userId, UserRole role) {
    public IdentityActor toActor() {
        return new IdentityActor(userId, role);
    }
}
