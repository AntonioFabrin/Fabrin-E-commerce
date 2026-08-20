package com.fabrinmarket.identity.application.port.in;

public interface RegisterUserUseCase {
    Integer register(RegisterUserCommand command);

    record RegisterUserCommand(String name, String email, String rawPassword, String role) {
    }
}
