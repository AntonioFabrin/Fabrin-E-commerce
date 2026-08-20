package com.fabrinmarket.identity.application.port.in;

import com.fabrinmarket.identity.application.model.UserView;

public interface AuthenticateUserUseCase {
    AuthenticationResult authenticate(AuthenticateUserCommand command);

    record AuthenticateUserCommand(String email, String rawPassword) {
    }

    record AuthenticationResult(String token, UserView user) {
    }
}
