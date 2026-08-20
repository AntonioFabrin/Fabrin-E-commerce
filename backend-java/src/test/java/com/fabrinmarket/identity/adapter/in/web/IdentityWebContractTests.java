package com.fabrinmarket.identity.adapter.in.web;

import com.fabrinmarket.identity.adapter.in.security.IdentityPrincipal;
import com.fabrinmarket.identity.adapter.in.security.SecurityErrorWriter;
import com.fabrinmarket.identity.application.model.UserView;
import com.fabrinmarket.identity.application.port.in.AuthenticateUserUseCase;
import com.fabrinmarket.identity.application.port.in.ChangeUserRoleUseCase;
import com.fabrinmarket.identity.application.port.in.DeleteUserUseCase;
import com.fabrinmarket.identity.application.port.in.GetCurrentUserUseCase;
import com.fabrinmarket.identity.application.port.in.ListUsersUseCase;
import com.fabrinmarket.identity.application.port.in.RegisterUserUseCase;
import com.fabrinmarket.identity.application.port.in.UpdateUserProfileUseCase;
import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.domain.exception.InvalidCredentialsException;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AuthController.class, UserController.class, IdentityExceptionHandler.class})
@AutoConfigureMockMvc(addFilters = false)
class IdentityWebContractTests {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private RegisterUserUseCase registerUser;
    @MockitoBean
    private AuthenticateUserUseCase authenticateUser;
    @MockitoBean
    private GetCurrentUserUseCase getCurrentUser;
    @MockitoBean
    private UpdateUserProfileUseCase updateProfile;
    @MockitoBean
    private DeleteUserUseCase deleteUser;
    @MockitoBean
    private ListUsersUseCase listUsers;
    @MockitoBean
    private ChangeUserRoleUseCase changeRole;
    @MockitoBean
    private TokenProviderPort tokenProvider;
    @MockitoBean
    private SecurityErrorWriter securityErrorWriter;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void exposesTheCompatibleRegistrationAndLoginContracts() throws Exception {
        given(registerUser.register(any())).willReturn(7);
        given(authenticateUser.authenticate(any())).willReturn(
                new AuthenticateUserUseCase.AuthenticationResult("jwt-token", user(7, "customer"))
        );

        mvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Maria Silva","email":"maria@example.com","password":"senha123","role":"customer"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.mensagem").value("Id criado com sucesso"));

        mvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"maria@example.com","password":"senha123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.role").value("customer"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    void validatesBodiesAndDoesNotAcceptRoleInProfileUpdates() throws Exception {
        mvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"M","email":"invalido","password":"123","role":"admin"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDATION_ERROR"));

        authenticateAs(7, UserRole.CUSTOMER);
        mvc.perform(put("/api/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Maria Silva","email":"maria@example.com","role":"admin"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("INVALID_REQUEST_BODY"));
    }

    @Test
    void returnsTheSameGenericErrorForInvalidLogin() throws Exception {
        given(authenticateUser.authenticate(any())).willThrow(new InvalidCredentialsException());

        mvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"missing@example.com","password":"senha123"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas."))
                .andExpect(jsonPath("$.codigo").value("INVALID_CREDENTIALS"));
    }

    @Test
    void exposesCurrentUserAndTheLegacyUpdateRoute() throws Exception {
        given(getCurrentUser.getCurrentUser(any())).willReturn(user(7, "customer"));
        given(updateProfile.updateProfile(any(), eq(7), any())).willReturn(user(7, "customer"));
        authenticateAs(7, UserRole.CUSTOMER);

        mvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));

        mvc.perform(put("/api/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Maria Silva","email":"maria@example.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("customer"));
    }

    @Test
    void keepsTheLegacyAdministrativeListEnvelope() throws Exception {
        given(listUsers.listUsers(any())).willReturn(List.of(user(1, "admin"), user(7, "customer")));
        authenticateAs(1, UserRole.ADMIN);

        mvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.usuarios[1].role").value("customer"));
    }

    private UsernamePasswordAuthenticationToken authenticationToken(int id, UserRole role) {
        return UsernamePasswordAuthenticationToken.authenticated(
                new IdentityPrincipal(id, role),
                null,
                List.of(() -> "ROLE_" + role.name())
        );
    }

    private void authenticateAs(int id, UserRole role) {
        SecurityContextHolder.getContext().setAuthentication(authenticationToken(id, role));
    }

    private UserView user(int id, String role) {
        return new UserView(
                id,
                "Maria Silva",
                "maria@example.com",
                role,
                LocalDateTime.of(2026, 8, 19, 12, 0)
        );
    }
}
