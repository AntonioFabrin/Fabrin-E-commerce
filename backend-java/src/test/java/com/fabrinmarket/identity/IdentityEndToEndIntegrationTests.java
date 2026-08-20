package com.fabrinmarket.identity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IdentityEndToEndIntegrationTests {

    private static final String JWT_SECRET = "integration-test-jwt-secret-with-at-least-32-bytes";

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureApplication(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("security.jwt.secret", () -> JWT_SECRET);
        registry.add("security.jwt.issuer", () -> "fabrinmarket-integration-test");
        registry.add("security.jwt.expiration", () -> "PT8H");
    }

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordHasherPort passwords;

    @Test
    void executesTheCompleteIdentityAndAuthorizationFlow() {
        assertStatus(exchange(HttpMethod.GET, "/api/me", null, null), HttpStatus.UNAUTHORIZED);

        var malformed = headers(null);
        malformed.set(HttpHeaders.AUTHORIZATION, "Token qualquer");
        var malformedResponse = http.exchange(
                "/api/me", HttpMethod.GET, new HttpEntity<>(malformed), JsonNode.class
        );
        assertStatus(malformedResponse, HttpStatus.UNAUTHORIZED);
        assertThat(malformedResponse.getBody().path("codigo").asText()).isEqualTo("INVALID_TOKEN");

        var customerId = register("Customer User", "customer@example.com", "senha123", "customer");
        var sellerId = register("Seller User", "seller@example.com", "senha123", "seller");

        var duplicate = post("/api/register", Map.of(
                "name", "Customer Duplicate",
                "email", "CUSTOMER@example.com",
                "password", "senha123",
                "role", "customer"
        ));
        assertStatus(duplicate, HttpStatus.CONFLICT);

        var publicAdmin = post("/api/register", Map.of(
                "name", "Public Admin",
                "email", "public-admin@example.com",
                "password", "senha123",
                "role", "admin"
        ));
        assertStatus(publicAdmin, HttpStatus.BAD_REQUEST);

        var wrongPassword = post("/api/login", Map.of("email", "customer@example.com", "password", "senha-errada"));
        var missingUser = post("/api/login", Map.of("email", "missing@example.com", "password", "senha-errada"));
        assertStatus(wrongPassword, HttpStatus.UNAUTHORIZED);
        assertStatus(missingUser, HttpStatus.UNAUTHORIZED);
        assertThat(wrongPassword.getBody().path("erro").asText())
                .isEqualTo(missingUser.getBody().path("erro").asText())
                .isEqualTo("Credenciais inválidas.");

        var customerToken = login("customer@example.com", "senha123");
        var sellerToken = login("seller@example.com", "senha123");

        var me = exchange(HttpMethod.GET, "/api/me", null, customerToken);
        assertStatus(me, HttpStatus.OK);
        assertThat(me.getBody().path("id").asInt()).isEqualTo(customerId);
        assertThat(me.getBody().has("password")).isFalse();

        var customerUpdatesSeller = exchange(
                HttpMethod.PUT,
                "/api/" + sellerId,
                Map.of("name", "Changed Seller", "email", "changed-seller@example.com"),
                customerToken
        );
        assertStatus(customerUpdatesSeller, HttpStatus.FORBIDDEN);

        var roleEscalation = exchange(
                HttpMethod.PUT,
                "/api/" + customerId,
                Map.of("name", "Customer User", "email", "customer@example.com", "role", "admin"),
                customerToken
        );
        assertStatus(roleEscalation, HttpStatus.BAD_REQUEST);

        assertStatus(exchange(HttpMethod.GET, "/api/users", null, customerToken), HttpStatus.FORBIDDEN);
        assertStatus(exchange(
                HttpMethod.PATCH,
                "/api/users/" + customerId + "/role",
                Map.of("role", "admin"),
                customerToken
        ), HttpStatus.FORBIDDEN);

        var adminId = seedAdmin();
        var adminToken = login("admin.integration@example.com", "senha-admin");

        var users = exchange(HttpMethod.GET, "/api/users", null, adminToken);
        assertStatus(users, HttpStatus.OK);
        assertThat(users.getBody().path("total").asInt()).isEqualTo(3);

        var promoted = exchange(
                HttpMethod.PATCH,
                "/api/users/" + customerId + "/role",
                Map.of("role", "seller"),
                adminToken
        );
        assertStatus(promoted, HttpStatus.OK);
        assertThat(promoted.getBody().path("user").path("role").asText()).isEqualTo("seller");

        var adminUpdatesSeller = exchange(
                HttpMethod.PUT,
                "/api/" + sellerId,
                Map.of("name", "Seller Updated By Admin", "email", "seller-updated@example.com"),
                adminToken
        );
        assertStatus(adminUpdatesSeller, HttpStatus.OK);
        assertThat(adminUpdatesSeller.getBody().path("user").path("name").asText())
                .isEqualTo("Seller Updated By Admin");

        var demotedAdmin = exchange(
                HttpMethod.PATCH,
                "/api/users/" + adminId + "/role",
                Map.of("role", "customer"),
                adminToken
        );
        assertStatus(demotedAdmin, HttpStatus.OK);

        var staleAdminToken = exchange(HttpMethod.GET, "/api/users", null, adminToken);
        assertStatus(staleAdminToken, HttpStatus.FORBIDDEN);

        var selfDelete = exchange(HttpMethod.DELETE, "/api/me", null, sellerToken);
        assertStatus(selfDelete, HttpStatus.OK);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE id = ?", Integer.class, sellerId))
                .isZero();
    }

    private int register(String name, String email, String password, String role) {
        var response = post("/api/register", Map.of(
                "name", name,
                "email", email,
                "password", password,
                "role", role
        ));
        assertStatus(response, HttpStatus.CREATED);
        return response.getBody().path("id").asInt();
    }

    private String login(String email, String password) {
        var response = post("/api/login", Map.of("email", email, "password", password));
        assertStatus(response, HttpStatus.OK);
        return response.getBody().path("token").asText();
    }

    private int seedAdmin() {
        return jdbc.queryForObject(
                """
                        INSERT INTO users (name, email, password, role)
                        VALUES (?, ?, ?, 'admin')
                        RETURNING id
                        """,
                Integer.class,
                "Integration Admin",
                "admin.integration@example.com",
                passwords.hash("senha-admin")
        );
    }

    private ResponseEntity<JsonNode> post(String path, Object body) {
        return exchange(HttpMethod.POST, path, body, null);
    }

    private ResponseEntity<JsonNode> exchange(HttpMethod method, String path, Object body, String token) {
        return http.exchange(path, method, new HttpEntity<>(body, headers(token)), JsonNode.class);
    }

    private HttpHeaders headers(String token) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) {
            headers.setBearerAuth(token);
        }
        return headers;
    }

    private void assertStatus(ResponseEntity<JsonNode> response, HttpStatus expected) {
        assertThat(response.getStatusCode())
                .withFailMessage("Expected %s but received %s with body %s", expected, response.getStatusCode(), response.getBody())
                .isEqualTo(expected);
    }
}
