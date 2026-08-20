package com.fabrinmarket.identity.application.service;

import com.fabrinmarket.identity.application.model.UserView;
import com.fabrinmarket.identity.application.port.in.AuthenticateUserUseCase;
import com.fabrinmarket.identity.application.port.in.ChangeUserRoleUseCase;
import com.fabrinmarket.identity.application.port.in.DeleteUserUseCase;
import com.fabrinmarket.identity.application.port.in.GetCurrentUserUseCase;
import com.fabrinmarket.identity.application.port.in.ListUsersUseCase;
import com.fabrinmarket.identity.application.port.in.RegisterUserUseCase;
import com.fabrinmarket.identity.application.port.in.UpdateUserProfileUseCase;
import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.application.port.out.UserRepositoryPort;
import com.fabrinmarket.identity.domain.exception.EmailAlreadyInUseException;
import com.fabrinmarket.identity.domain.exception.ForbiddenOperationException;
import com.fabrinmarket.identity.domain.exception.InvalidCredentialsException;
import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;
import com.fabrinmarket.identity.domain.exception.UserNotFoundException;
import com.fabrinmarket.identity.domain.model.EmailAddress;
import com.fabrinmarket.identity.domain.model.IdentityActor;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserName;
import com.fabrinmarket.identity.domain.model.UserRole;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

public final class IdentityService implements
        RegisterUserUseCase,
        AuthenticateUserUseCase,
        GetCurrentUserUseCase,
        UpdateUserProfileUseCase,
        DeleteUserUseCase,
        ListUsersUseCase,
        ChangeUserRoleUseCase {

    private static final int MINIMUM_PASSWORD_LENGTH = 8;
    private static final int MAXIMUM_PASSWORD_LENGTH = 72;

    private final UserRepositoryPort users;
    private final PasswordHasherPort passwords;
    private final TokenProviderPort tokens;
    private final Clock clock;

    public IdentityService(
            UserRepositoryPort users,
            PasswordHasherPort passwords,
            TokenProviderPort tokens,
            Clock clock
    ) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.clock = clock;
    }

    @Override
    public Integer register(RegisterUserCommand command) {
        var name = new UserName(command.name());
        var email = new EmailAddress(command.email());
        validatePassword(command.rawPassword());

        var role = UserRole.from(command.role());
        if (role == UserRole.ADMIN) {
            throw new ForbiddenOperationException();
        }
        if (users.findByEmail(email.value()).isPresent()) {
            throw new EmailAlreadyInUseException();
        }

        var user = new User(
                null,
                name,
                email,
                passwords.hash(command.rawPassword()),
                role,
                LocalDateTime.now(clock)
        );
        return users.save(user).id();
    }

    @Override
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        var email = new EmailAddress(command.email());
        var user = users.findByEmail(email.value()).orElseThrow(InvalidCredentialsException::new);

        if (command.rawPassword() == null || !passwords.matches(command.rawPassword(), user.passwordHash())) {
            throw new InvalidCredentialsException();
        }

        return new AuthenticationResult(tokens.issue(user), UserView.from(user));
    }

    @Override
    public UserView getCurrentUser(IdentityActor actor) {
        return UserView.from(findUser(actor.userId()));
    }

    @Override
    public UserView updateProfile(IdentityActor actor, Integer targetUserId, UpdateProfileCommand command) {
        authorizeSelfOrAdmin(actor, targetUserId);
        var user = findUser(targetUserId);
        var name = new UserName(command.name());
        var email = new EmailAddress(command.email());

        if (users.existsByEmailAndIdNot(email.value(), targetUserId)) {
            throw new EmailAlreadyInUseException();
        }

        return UserView.from(users.save(user.withProfile(name, email)));
    }

    @Override
    public void deleteUser(IdentityActor actor, Integer targetUserId) {
        authorizeSelfOrAdmin(actor, targetUserId);
        findUser(targetUserId);
        users.deleteById(targetUserId);
    }

    @Override
    public List<UserView> listUsers(IdentityActor actor) {
        requireCurrentAdmin(actor);
        return users.findAll().stream().map(UserView::from).toList();
    }

    @Override
    public UserView changeRole(IdentityActor actor, Integer targetUserId, String role) {
        requireCurrentAdmin(actor);
        var target = findUser(targetUserId);
        return UserView.from(users.save(target.withRole(UserRole.from(role))));
    }

    private void authorizeSelfOrAdmin(IdentityActor actor, Integer targetUserId) {
        if (actor.userId().equals(targetUserId)) {
            return;
        }
        requireCurrentAdmin(actor);
    }

    private void requireCurrentAdmin(IdentityActor actor) {
        var currentActor = findUser(actor.userId());
        if (currentActor.role() != UserRole.ADMIN) {
            throw new ForbiddenOperationException();
        }
    }

    private User findUser(Integer id) {
        if (id == null || id <= 0) {
            throw new UserNotFoundException();
        }
        return users.findById(id).orElseThrow(UserNotFoundException::new);
    }

    private void validatePassword(String rawPassword) {
        if (rawPassword == null
                || rawPassword.length() < MINIMUM_PASSWORD_LENGTH
                || rawPassword.length() > MAXIMUM_PASSWORD_LENGTH) {
            throw new InvalidUserDataException("A senha deve ter entre 8 e 72 caracteres.");
        }
    }
}
