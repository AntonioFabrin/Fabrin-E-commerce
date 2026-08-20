package com.fabrinmarket.identity.adapter.in.web;

import com.fabrinmarket.identity.adapter.in.security.IdentityPrincipal;
import com.fabrinmarket.identity.adapter.in.web.dto.ChangeRoleRequest;
import com.fabrinmarket.identity.adapter.in.web.dto.MessageResponse;
import com.fabrinmarket.identity.adapter.in.web.dto.UpdateProfileRequest;
import com.fabrinmarket.identity.adapter.in.web.dto.UserMutationResponse;
import com.fabrinmarket.identity.adapter.in.web.dto.UserResponse;
import com.fabrinmarket.identity.adapter.in.web.dto.UsersResponse;
import com.fabrinmarket.identity.application.port.in.ChangeUserRoleUseCase;
import com.fabrinmarket.identity.application.port.in.DeleteUserUseCase;
import com.fabrinmarket.identity.application.port.in.GetCurrentUserUseCase;
import com.fabrinmarket.identity.application.port.in.ListUsersUseCase;
import com.fabrinmarket.identity.application.port.in.UpdateUserProfileUseCase;
import com.fabrinmarket.identity.application.port.in.UpdateUserProfileUseCase.UpdateProfileCommand;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    private final GetCurrentUserUseCase getCurrentUser;
    private final UpdateUserProfileUseCase updateProfile;
    private final DeleteUserUseCase deleteUser;
    private final ListUsersUseCase listUsers;
    private final ChangeUserRoleUseCase changeRole;

    public UserController(
            GetCurrentUserUseCase getCurrentUser,
            UpdateUserProfileUseCase updateProfile,
            DeleteUserUseCase deleteUser,
            ListUsersUseCase listUsers,
            ChangeUserRoleUseCase changeRole
    ) {
        this.getCurrentUser = getCurrentUser;
        this.updateProfile = updateProfile;
        this.deleteUser = deleteUser;
        this.listUsers = listUsers;
        this.changeRole = changeRole;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal IdentityPrincipal principal) {
        return UserResponse.from(getCurrentUser.getCurrentUser(principal.toActor()));
    }

    @PutMapping("/me")
    public UserMutationResponse updateMe(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return update(principal, principal.userId(), request);
    }

    @PutMapping({"/{id:\\d+}", "/users/{id:\\d+}"})
    public UserMutationResponse updateById(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return update(principal, id, request);
    }

    @DeleteMapping("/me")
    public MessageResponse deleteMe(@AuthenticationPrincipal IdentityPrincipal principal) {
        return delete(principal, principal.userId());
    }

    @DeleteMapping({"/{id:\\d+}", "/users/{id:\\d+}"})
    public MessageResponse deleteById(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id
    ) {
        return delete(principal, id);
    }

    @GetMapping("/users")
    public UsersResponse users(@AuthenticationPrincipal IdentityPrincipal principal) {
        var users = listUsers.listUsers(principal.toActor()).stream().map(UserResponse::from).toList();
        return new UsersResponse(users.size(), users);
    }

    @PatchMapping("/users/{id:\\d+}/role")
    public UserMutationResponse changeRole(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id,
            @Valid @RequestBody ChangeRoleRequest request
    ) {
        var user = changeRole.changeRole(principal.toActor(), id, request.role());
        return new UserMutationResponse("Role atualizada com sucesso!", UserResponse.from(user));
    }

    private UserMutationResponse update(
            IdentityPrincipal principal,
            Integer targetId,
            UpdateProfileRequest request
    ) {
        var user = updateProfile.updateProfile(
                principal.toActor(),
                targetId,
                new UpdateProfileCommand(request.name(), request.email())
        );
        return new UserMutationResponse("Usuário atualizado com sucesso!", UserResponse.from(user));
    }

    private MessageResponse delete(IdentityPrincipal principal, Integer targetId) {
        deleteUser.deleteUser(principal.toActor(), targetId);
        return new MessageResponse("Usuário " + targetId + " foi deletado com sucesso do sistema!");
    }
}
