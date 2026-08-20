package com.fabrinmarket.identity.application.port.in;

import com.fabrinmarket.identity.application.model.UserView;
import com.fabrinmarket.identity.domain.model.IdentityActor;

public interface UpdateUserProfileUseCase {
    UserView updateProfile(IdentityActor actor, Integer targetUserId, UpdateProfileCommand command);

    record UpdateProfileCommand(String name, String email) {
    }
}
