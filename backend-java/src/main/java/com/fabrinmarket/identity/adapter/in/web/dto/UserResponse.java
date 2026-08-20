package com.fabrinmarket.identity.adapter.in.web.dto;

import com.fabrinmarket.identity.application.model.UserView;

import java.time.LocalDateTime;

public record UserResponse(
        Integer id,
        String name,
        String email,
        String role,
        LocalDateTime createdAt
) {
    public static UserResponse from(UserView user) {
        return new UserResponse(user.id(), user.name(), user.email(), user.role(), user.createdAt());
    }
}
