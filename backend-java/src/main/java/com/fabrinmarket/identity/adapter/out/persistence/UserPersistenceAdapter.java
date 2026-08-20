package com.fabrinmarket.identity.adapter.out.persistence;

import com.fabrinmarket.identity.application.port.out.UserRepositoryPort;
import com.fabrinmarket.identity.domain.exception.EmailAlreadyInUseException;
import com.fabrinmarket.identity.domain.model.EmailAddress;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserName;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final SpringDataUserRepository repository;

    public UserPersistenceAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<User> findById(Integer id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String normalizedEmail) {
        return repository.findByNormalizedEmail(normalizedEmail).map(this::toDomain);
    }

    @Override
    public boolean existsByEmailAndIdNot(String normalizedEmail, Integer excludedId) {
        return repository.existsByNormalizedEmailAndIdNot(normalizedEmail, excludedId);
    }

    @Override
    public User save(User user) {
        try {
            return toDomain(repository.saveAndFlush(toEntity(user)));
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyInUseException();
        }
    }

    @Override
    public List<User> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
        repository.flush();
    }

    private UserJpaEntity toEntity(User user) {
        return new UserJpaEntity(
                user.id(),
                user.name().value(),
                user.email().value(),
                user.passwordHash(),
                user.role().value(),
                user.createdAt()
        );
    }

    private User toDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                new UserName(entity.getName()),
                new EmailAddress(entity.getEmail()),
                entity.getPasswordHash(),
                UserRole.from(entity.getRole()),
                entity.getCreatedAt()
        );
    }
}
