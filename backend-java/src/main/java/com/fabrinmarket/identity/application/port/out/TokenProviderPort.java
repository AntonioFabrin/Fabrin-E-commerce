package com.fabrinmarket.identity.application.port.out;

import com.fabrinmarket.identity.domain.model.IdentityActor;
import com.fabrinmarket.identity.domain.model.User;

public interface TokenProviderPort {
    String issue(User user);

    IdentityActor verify(String token);
}
