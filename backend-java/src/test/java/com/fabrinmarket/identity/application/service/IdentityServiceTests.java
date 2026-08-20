package com.fabrinmarket.identity.application.service;

import com.fabrinmarket.identity.application.port.in.AuthenticateUserUseCase.AuthenticateUserCommand;
import com.fabrinmarket.identity.application.port.in.RegisterUserUseCase.RegisterUserCommand;
import com.fabrinmarket.identity.application.port.in.UpdateUserProfileUseCase.UpdateProfileCommand;
import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.application.port.out.UserRepositoryPort;
import com.fabrinmarket.identity.domain.exception.EmailAlreadyInUseException;
import com.fabrinmarket.identity.domain.exception.ForbiddenOperationException;
import com.fabrinmarket.identity.domain.exception.InvalidCredentialsException;
import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;
import com.fabrinmarket.identity.domain.model.EmailAddress;
import com.fabrinmarket.identity.domain.model.IdentityActor;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserName;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IdentityServiceTests {

    private InMemoryUsers users;
    private IdentityService service;

    @BeforeEach
    void setUp() {
        users = new InMemoryUsers();
        var clock = Clock.fixed(Instant.parse("2026-08-19T12:00:00Z"), ZoneOffset.UTC);
        service = new IdentityService(users, new FakePasswords(), new FakeTokens(), clock);
    }

    @Test
    void registersANormalizedCustomerWithHashedPassword() {
        var id = service.register(new RegisterUserCommand(
                "  Maria Silva  ", "  MARIA@Example.com ", "senha123", null
        ));

        var saved = users.findById(id).orElseThrow();
        assertThat(saved.name().value()).isEqualTo("Maria Silva");
        assertThat(saved.email().value()).isEqualTo("maria@example.com");
        assertThat(saved.passwordHash()).isEqualTo("hash:senha123");
        assertThat(saved.role()).isEqualTo(UserRole.CUSTOMER);
    }

    @Test
    void rejectsPublicAdminRegistrationAndDuplicateEmail() {
        assertThatThrownBy(() -> service.register(new RegisterUserCommand(
                "Admin User", "admin@example.com", "senha123", "admin"
        ))).isInstanceOf(ForbiddenOperationException.class);

        service.register(new RegisterUserCommand("Maria Silva", "maria@example.com", "senha123", "seller"));
        assertThatThrownBy(() -> service.register(new RegisterUserCommand(
                "Outra Maria", "MARIA@example.com", "senha123", "customer"
        ))).isInstanceOf(EmailAlreadyInUseException.class);
    }

    @Test
    void enforcesThePasswordPolicy() {
        assertThatThrownBy(() -> service.register(new RegisterUserCommand(
                "Maria Silva", "maria@example.com", "1234567", "customer"
        ))).isInstanceOf(InvalidUserDataException.class);
    }

    @Test
    void authenticatesWithoutRevealingWhetherTheEmailExists() {
        service.register(new RegisterUserCommand("Maria Silva", "maria@example.com", "senha123", "customer"));

        var result = service.authenticate(new AuthenticateUserCommand("MARIA@example.com", "senha123"));
        assertThat(result.token()).startsWith("token:");
        assertThat(result.user().email()).isEqualTo("maria@example.com");

        assertThatThrownBy(() -> service.authenticate(new AuthenticateUserCommand("maria@example.com", "errada")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Credenciais inválidas.");
        assertThatThrownBy(() -> service.authenticate(new AuthenticateUserCommand("naoexiste@example.com", "errada")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Credenciais inválidas.");
    }

    @Test
    void blocksUpdatingAnotherUserAndNeverChangesRoleThroughTheProfile() {
        var first = register("Primeiro User", "first@example.com", UserRole.CUSTOMER);
        var second = register("Segundo User", "second@example.com", UserRole.SELLER);

        assertThatThrownBy(() -> service.updateProfile(
                new IdentityActor(first.id(), first.role()),
                second.id(),
                new UpdateProfileCommand("Nome Alterado", "alterado@example.com")
        )).isInstanceOf(ForbiddenOperationException.class);

        var updated = service.updateProfile(
                new IdentityActor(second.id(), second.role()),
                second.id(),
                new UpdateProfileCommand("Nome Alterado", "alterado@example.com")
        );
        assertThat(updated.role()).isEqualTo("seller");
    }

    @Test
    void usesTheCurrentDatabaseRoleForAdministrativeOperations() {
        var admin = register("Admin User", "admin@example.com", UserRole.ADMIN);
        var customer = register("Customer User", "customer@example.com", UserRole.CUSTOMER);

        assertThat(service.listUsers(new IdentityActor(admin.id(), UserRole.ADMIN))).hasSize(2);
        var promoted = service.changeRole(new IdentityActor(admin.id(), UserRole.ADMIN), customer.id(), "seller");
        assertThat(promoted.role()).isEqualTo("seller");

        users.save(admin.withRole(UserRole.CUSTOMER));
        assertThatThrownBy(() -> service.listUsers(new IdentityActor(admin.id(), UserRole.ADMIN)))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void allowsSelfDeletionAndOnlyLetsAdminsDeleteOtherUsers() {
        var customer = register("Customer User", "customer@example.com", UserRole.CUSTOMER);
        var other = register("Other User", "other@example.com", UserRole.CUSTOMER);
        var admin = register("Admin User", "admin@example.com", UserRole.ADMIN);

        assertThatThrownBy(() -> service.deleteUser(
                new IdentityActor(customer.id(), customer.role()), other.id()
        )).isInstanceOf(ForbiddenOperationException.class);

        service.deleteUser(new IdentityActor(customer.id(), customer.role()), customer.id());
        assertThat(users.findById(customer.id())).isEmpty();

        service.deleteUser(new IdentityActor(admin.id(), admin.role()), other.id());
        assertThat(users.findById(other.id())).isEmpty();
    }

    private User register(String name, String email, UserRole role) {
        return users.save(new User(
                null,
                new UserName(name),
                new EmailAddress(email),
                "hash:senha123",
                role,
                LocalDateTime.of(2026, 8, 19, 12, 0)
        ));
    }

    private static final class FakePasswords implements PasswordHasherPort {
        @Override
        public String hash(String rawPassword) {
            return "hash:" + rawPassword;
        }

        @Override
        public boolean matches(String rawPassword, String passwordHash) {
            return ("hash:" + rawPassword).equals(passwordHash);
        }
    }

    private static final class FakeTokens implements TokenProviderPort {
        @Override
        public String issue(User user) {
            return "token:" + user.id();
        }

        @Override
        public IdentityActor verify(String token) {
            throw new UnsupportedOperationException("not needed by these application tests");
        }
    }

    private static final class InMemoryUsers implements UserRepositoryPort {
        private final Map<Integer, User> data = new LinkedHashMap<>();
        private int sequence;

        @Override
        public Optional<User> findById(Integer id) {
            return Optional.ofNullable(data.get(id));
        }

        @Override
        public Optional<User> findByEmail(String normalizedEmail) {
            return data.values().stream()
                    .filter(user -> user.email().value().equals(normalizedEmail))
                    .findFirst();
        }

        @Override
        public boolean existsByEmailAndIdNot(String normalizedEmail, Integer excludedId) {
            return data.values().stream().anyMatch(user ->
                    user.email().value().equals(normalizedEmail) && !user.id().equals(excludedId)
            );
        }

        @Override
        public User save(User user) {
            var saved = user.id() == null ? user.withId(++sequence) : user;
            data.put(saved.id(), saved);
            return saved;
        }

        @Override
        public List<User> findAll() {
            return new ArrayList<>(data.values());
        }

        @Override
        public void deleteById(Integer id) {
            data.remove(id);
        }
    }
}
