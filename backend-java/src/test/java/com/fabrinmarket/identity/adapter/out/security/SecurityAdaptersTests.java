package com.fabrinmarket.identity.adapter.out.security;

import com.fabrinmarket.identity.domain.exception.InvalidTokenException;
import com.fabrinmarket.identity.domain.model.EmailAddress;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserName;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SecurityAdaptersTests {

    private static final String SECRET = "test-only-jwt-secret-with-at-least-32-bytes";
    private static final Instant NOW = Instant.parse("2026-08-19T12:00:00Z");

    @Test
    void hashesPasswordsAndReadsNodeCompatibleBcryptHashes() {
        var passwords = new BcryptPasswordHasherAdapter();

        var hash = passwords.hash("senha-nova");
        assertThat(passwords.matches("senha-nova", hash)).isTrue();
        assertThat(passwords.matches("senha-errada", hash)).isFalse();
        assertThat(passwords.matches(
                "senha-legada",
                "$2b$10$ca.H5qFfEN2jGwYUgEZbrO/uFX7FdBFa0tdK8rssZMmYBtb5/FM4O"
        )).isTrue();
    }

    @Test
    void issuesAndVerifiesTheRequiredJwtClaims() {
        var provider = providerAt(NOW);
        var token = provider.issue(user());
        var actor = provider.verify(token);

        assertThat(actor.userId()).isEqualTo(42);
        assertThat(actor.tokenRole()).isEqualTo(UserRole.SELLER);
    }

    @Test
    void rejectsExpiredOrTamperedTokens() {
        var token = providerAt(NOW).issue(user());

        assertThatThrownBy(() -> providerAt(NOW.plus(Duration.ofHours(9))).verify(token))
                .isInstanceOf(InvalidTokenException.class);
        assertThatThrownBy(() -> providerAt(NOW).verify(token + "tampered"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void refusesSecretsShorterThan32Bytes() {
        var properties = new JwtProperties("short-secret", Duration.ofHours(8), "issuer");
        assertThatThrownBy(() -> new JwtTokenProviderAdapter(properties, Clock.systemUTC()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("32 bytes");
    }

    private JwtTokenProviderAdapter providerAt(Instant instant) {
        var properties = new JwtProperties(SECRET, Duration.ofHours(8), "fabrinmarket-api-test");
        return new JwtTokenProviderAdapter(properties, Clock.fixed(instant, ZoneOffset.UTC));
    }

    private User user() {
        return new User(
                42,
                new UserName("Maria Silva"),
                new EmailAddress("maria@example.com"),
                "$2b$10$hash",
                UserRole.SELLER,
                LocalDateTime.of(2026, 8, 19, 12, 0)
        );
    }
}
