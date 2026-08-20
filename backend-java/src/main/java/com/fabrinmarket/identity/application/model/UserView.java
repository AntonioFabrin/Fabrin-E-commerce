package com.fabrinmarket.identity.application.model;

import com.fabrinmarket.identity.domain.model.User;

import java.time.LocalDateTime;

public record UserView(
        Integer id,
        String name,
        String email,
        String role,
        LocalDateTime createdAt
) {
    public static UserView from(User user) {
        return new UserView(
                user.id(),
                user.name().value(),
                user.email().value(),
                user.role().value(),
                user.createdAt()
        );
    }
}
