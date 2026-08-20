package com.fabrinmarket.identity.application.port.in;

import com.fabrinmarket.identity.application.model.UserView;
import com.fabrinmarket.identity.domain.model.IdentityActor;

import java.util.List;

public interface ListUsersUseCase {
    List<UserView> listUsers(IdentityActor actor);
}
