package com.fabrinmarket.identity.config;

import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.application.port.out.UserRepositoryPort;
import com.fabrinmarket.identity.application.service.IdentityService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class IdentityModuleConfiguration {

    @Bean
    IdentityService identityService(
            UserRepositoryPort users,
            PasswordHasherPort passwords,
            TokenProviderPort tokens,
            Clock clock
    ) {
        return new IdentityService(users, passwords, tokens, clock);
    }
}
