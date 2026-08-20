package com.fabrinmarket.identity.adapter.in.security;

import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.domain.exception.InvalidTokenException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final TokenProviderPort tokens;
    private final SecurityErrorWriter errors;

    public JwtAuthenticationFilter(TokenProviderPort tokens, SecurityErrorWriter errors) {
        this.tokens = tokens;
        this.errors = errors;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        var authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || authorization.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!authorization.startsWith(BEARER_PREFIX) || authorization.length() == BEARER_PREFIX.length()) {
            errors.write(response, HttpStatus.UNAUTHORIZED.value(), "INVALID_TOKEN", "Token inválido ou expirado.");
            return;
        }

        try {
            var actor = tokens.verify(authorization.substring(BEARER_PREFIX.length()));
            var principal = new IdentityPrincipal(actor.userId(), actor.tokenRole());
            var authority = new SimpleGrantedAuthority("ROLE_" + actor.tokenRole().name());
            var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (InvalidTokenException exception) {
            SecurityContextHolder.clearContext();
            errors.write(response, HttpStatus.UNAUTHORIZED.value(), exception.code(), exception.getMessage());
        }
    }
}
