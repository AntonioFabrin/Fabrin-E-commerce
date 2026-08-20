package com.fabrinmarket.identity.application.port.out;

import com.fabrinmarket.identity.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    Optional<User> findById(Integer id);

    Optional<User> findByEmail(String normalizedEmail);

    boolean existsByEmailAndIdNot(String normalizedEmail, Integer excludedId);

    User save(User user);

    List<User> findAll();

    void deleteById(Integer id);
}
