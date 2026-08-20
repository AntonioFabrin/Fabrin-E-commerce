package com.fabrinmarket.identity.application.port.in;

import com.fabrinmarket.identity.application.model.UserView;
import com.fabrinmarket.identity.domain.model.IdentityActor;

public interface GetCurrentUserUseCase {
    UserView getCurrentUser(IdentityActor actor);
}
