package com.fabrinmarket.identity.adapter.in.web;

import com.fabrinmarket.identity.adapter.in.web.dto.LoginRequest;
import com.fabrinmarket.identity.adapter.in.web.dto.LoginResponse;
import com.fabrinmarket.identity.adapter.in.web.dto.RegisterRequest;
import com.fabrinmarket.identity.adapter.in.web.dto.RegisterResponse;
import com.fabrinmarket.identity.adapter.in.web.dto.UserResponse;
import com.fabrinmarket.identity.application.port.in.AuthenticateUserUseCase;
import com.fabrinmarket.identity.application.port.in.AuthenticateUserUseCase.AuthenticateUserCommand;
import com.fabrinmarket.identity.application.port.in.RegisterUserUseCase;
import com.fabrinmarket.identity.application.port.in.RegisterUserUseCase.RegisterUserCommand;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final RegisterUserUseCase registerUser;
    private final AuthenticateUserUseCase authenticateUser;

    public AuthController(RegisterUserUseCase registerUser, AuthenticateUserUseCase authenticateUser) {
        this.registerUser = registerUser;
        this.authenticateUser = authenticateUser;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        var id = registerUser.register(new RegisterUserCommand(
                request.name(), request.email(), request.password(), request.role()
        ));
        return new RegisterResponse("Id criado com sucesso", id);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var result = authenticateUser.authenticate(new AuthenticateUserCommand(request.email(), request.password()));
        return new LoginResponse(
                "Login conectado com sucesso!",
                result.token(),
                UserResponse.from(result.user())
        );
    }
}
