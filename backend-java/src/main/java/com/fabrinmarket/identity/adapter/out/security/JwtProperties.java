package com.fabrinmarket.identity.adapter.out.security;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(
        @NotBlank @Size(min = 32) String secret,
        @NotNull Duration expiration,
        @NotBlank String issuer
) {
    @AssertTrue(message = "security.jwt.expiration must be positive")
    public boolean isExpirationPositive() {
        return expiration != null && !expiration.isZero() && !expiration.isNegative();
    }
}
