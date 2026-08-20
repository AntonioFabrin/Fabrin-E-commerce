package com.fabrinmarket.identity.application.port.in;

import com.fabrinmarket.identity.domain.model.IdentityActor;

public interface DeleteUserUseCase {
    void deleteUser(IdentityActor actor, Integer targetUserId);
}
