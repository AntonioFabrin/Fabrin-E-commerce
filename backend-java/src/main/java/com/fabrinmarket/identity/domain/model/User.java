package com.fabrinmarket.identity.domain.model;

import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;

import java.time.LocalDateTime;
import java.util.Objects;

public record User(
        Integer id,
        UserName name,
        EmailAddress email,
        String passwordHash,
        UserRole role,
        LocalDateTime createdAt
) {

    public User {
        Objects.requireNonNull(name, "name is required");
        Objects.requireNonNull(email, "email is required");
        Objects.requireNonNull(role, "role is required");
        Objects.requireNonNull(createdAt, "createdAt is required");
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new InvalidUserDataException("Hash da senha é obrigatório.");
        }
    }

    public User withId(Integer assignedId) {
        return new User(assignedId, name, email, passwordHash, role, createdAt);
    }

    public User withProfile(UserName updatedName, EmailAddress updatedEmail) {
        return new User(id, updatedName, updatedEmail, passwordHash, role, createdAt);
    }

    public User withRole(UserRole updatedRole) {
        return new User(id, name, email, passwordHash, updatedRole, createdAt);
    }
}
