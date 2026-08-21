package com.fabrinmarket.orders;

import com.fasterxml.jackson.databind.JsonNode;
import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import org.junit.jupiter.api.BeforeEach;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderWebContractTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("security.jwt.secret", () -> "order-web-contract-integration-secret-with-at-least-32-bytes");
    }

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordHasherPort passwords;

    @BeforeEach
    void cleanDatabase() {
        jdbc.execute("TRUNCATE TABLE stock_reservations, order_items, payments, orders, products, users RESTART IDENTITY CASCADE");
        user("Buyer", "buyer@example.com", "customer");
        user("Other Buyer", "other@example.com", "customer");
        user("Seller", "seller@example.com", "seller");
        product("Produto web", "25.00", 4);
    }

    @Test
    void createsOnlyFromProductAndQuantityAndReturnsCompatibleBuyerAndSellerViews() {
        var buyerToken = login("buyer@example.com");
        var sellerToken = login("seller@example.com");

        assertThat(json(HttpMethod.POST, "/api/orders", Map.of("items", List.of(Map.of("productId", 1, "quantity", 2))), null, null)
                .getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        var created = json(
                HttpMethod.POST,
                "/api/orders",
                Map.of("items", List.of(Map.of("productId", 1, "quantity", 2))),
                buyerToken,
                "web-order-key"
        );
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().path("pedido_id").asInt()).isPositive();
        assertThat(created.getBody().path("valor_total").decimalValue()).isEqualByComparingTo("50.00");
        assertThat(created.getBody().path("referencia").asText()).startsWith("ORD-");

        var buyerOrders = json(HttpMethod.GET, "/api/orders/my", null, buyerToken, null);
        assertThat(buyerOrders.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(buyerOrders.getBody()).hasSize(1);
        assertThat(buyerOrders.getBody().get(0).path("items").get(0).path("price").decimalValue()).isEqualByComparingTo("25.00");
        assertThat(buyerOrders.getBody().get(0).path("external_reference").asText()).startsWith("ORD-");

        var otherBuyerOrders = json(HttpMethod.GET, "/api/orders/my", null, login("other@example.com"), null);
        assertThat(otherBuyerOrders.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(otherBuyerOrders.getBody()).isEmpty();

        var sellerOrders = json(HttpMethod.GET, "/api/orders/seller", null, sellerToken, null);
        assertThat(sellerOrders.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sellerOrders.getBody()).hasSize(1);
        assertThat(sellerOrders.getBody().get(0).path("buyer_name").asText()).isEqualTo("Buyer");
    }

    @Test
    void rejectsClientSuppliedPricesAndAStaleSellerToken() {
        var buyerToken = login("buyer@example.com");
        var badPayload = json(
                HttpMethod.POST,
                "/api/orders",
                Map.of("items", List.of(Map.of("productId", 1, "quantity", 1, "price", "0.01"))),
                buyerToken,
                "client-price-key"
        );
        assertThat(badPayload.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class)).isZero();

        var sellerToken = login("seller@example.com");
        jdbc.update("UPDATE users SET role = 'customer' WHERE email = 'seller@example.com'");
        var staleSeller = json(HttpMethod.GET, "/api/orders/seller", null, sellerToken, null);
        assertThat(staleSeller.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(staleSeller.getBody().path("codigo").asText()).isEqualTo("ORDER_ACCESS_DENIED");
    }

    private void user(String name, String email, String role) {
        jdbc.update(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                name, email, passwords.hash("senha123"), role
        );
    }

    private void product(String name, String price, int stock) {
        jdbc.update(
                """
                        INSERT INTO products (seller_id, name, description, price, stock, category_id, image_url, created_at)
                        VALUES (3, ?, '', ?, ?, 1, '', CURRENT_TIMESTAMP)
                        """,
                name, new BigDecimal(price), stock
        );
    }

    private String login(String email) {
        var response = json(HttpMethod.POST, "/api/login", Map.of("email", email, "password", "senha123"), null, null);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        return response.getBody().path("token").asText();
    }

    private ResponseEntity<JsonNode> json(HttpMethod method, String path, Object body, String token, String idempotencyKey) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) {
            headers.setBearerAuth(token);
        }
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return http.exchange(path, method, new HttpEntity<>(body, headers), JsonNode.class);
    }
}
