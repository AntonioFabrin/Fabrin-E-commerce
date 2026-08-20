package com.fabrinmarket.identity.adapter.out.security;

import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.domain.exception.InvalidTokenException;
import com.fabrinmarket.identity.domain.model.IdentityActor;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserRole;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Date;

@Component
public class JwtTokenProviderAdapter implements TokenProviderPort {

    private final JwtProperties properties;
    private final Clock clock;
    private final SecretKey signingKey;

    public JwtTokenProviderAdapter(JwtProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        var secretBytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET precisa ter ao menos 32 bytes UTF-8.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    @Override
    public String issue(User user) {
        var issuedAt = clock.instant();
        var expiresAt = issuedAt.plus(properties.expiration());

        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(user.id().toString())
                .claim("id", user.id())
                .claim("email", user.email().value())
                .claim("role", user.role().value())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    @Override
    public IdentityActor verify(String token) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(properties.issuer())
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            var id = claims.get("id", Integer.class);
            var role = UserRole.from(claims.get("role", String.class));
            if (id == null || !claims.getSubject().equals(id.toString())) {
                throw new InvalidTokenException();
            }
            return new IdentityActor(id, role);
        } catch (JwtException | IllegalArgumentException | NullPointerException exception) {
            throw new InvalidTokenException();
        }
    }
}
