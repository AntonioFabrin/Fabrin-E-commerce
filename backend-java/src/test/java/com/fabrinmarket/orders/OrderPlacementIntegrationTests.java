package com.fabrinmarket.orders;

import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.PlaceOrderCommand;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.RequestedItem;
import com.fabrinmarket.orders.application.service.OrderService;
import com.fabrinmarket.orders.domain.exception.InsufficientStockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
class OrderPlacementIntegrationTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("security.jwt.secret", () -> "order-placement-integration-secret-with-at-least-32-bytes");
    }

    @Autowired
    private OrderService orders;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void cleanDatabase() {
        jdbc.execute("TRUNCATE TABLE stock_reservations, order_items, payments, orders, products, users RESTART IDENTITY CASCADE");
        jdbc.update("INSERT INTO users (name, email, password, role) VALUES ('Buyer', 'buyer@example.com', 'hash', 'customer')");
        jdbc.update("INSERT INTO users (name, email, password, role) VALUES ('Seller', 'seller@example.com', 'hash', 'seller')");
    }

    @Test
    void storesServerPricesAndReservationsInTheSameTransactionAndReplaysSafely() {
        var productId = product("Produto seguro", "19.90", 3);
        var command = new PlaceOrderCommand(List.of(new RequestedItem(productId, 2)));

        var created = orders.placeOrder(1, command, "order-http-key-1");
        var replayed = orders.placeOrder(1, command, "order-http-key-1");

        assertThat(created.orderId()).isPositive();
        assertThat(created.reference()).startsWith("ORD-");
        assertThat(created.total()).isEqualByComparingTo("39.80");
        assertThat(replayed.orderId()).isEqualTo(created.orderId());
        assertThat(replayed.replayed()).isTrue();
        assertThat(jdbc.queryForObject("SELECT stock FROM products WHERE id = ?", Integer.class, productId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT price FROM order_items WHERE order_id = ?", java.math.BigDecimal.class, created.orderId()))
                .isEqualByComparingTo("19.90");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM stock_reservations WHERE order_id = ? AND status = 'reserved'", Integer.class, created.orderId()))
                .isEqualTo(1);
    }

    @Test
    void concurrentOrdersCannotOversellTheSameLastUnit() throws Exception {
        var productId = product("Última unidade", "10.00", 1);
        var command = new PlaceOrderCommand(List.of(new RequestedItem(productId, 1)));
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(place(1, command, "race-a"));
            var second = executor.submit(place(1, command, "race-b"));
            var outcomes = List.of(first.get(), second.get());

            assertThat(outcomes.stream().filter(Outcome::success).count()).isEqualTo(1);
            assertThat(outcomes.stream().filter(outcome -> outcome.failure instanceof InsufficientStockException).count()).isEqualTo(1);
        }
        assertThat(jdbc.queryForObject("SELECT stock FROM products WHERE id = ?", Integer.class, productId)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM stock_reservations", Integer.class)).isEqualTo(1);
    }

    @Test
    void cancellationReleasesTheReservationAndRestoresStockOnlyOnce() {
        var productId = product("Produto cancelável", "10.00", 2);
        var created = orders.placeOrder(1, new PlaceOrderCommand(List.of(new RequestedItem(productId, 2))), "cancel-key");

        var cancelled = orders.cancelOrder(1, created.orderId());
        var replayed = orders.cancelOrder(1, created.orderId());

        assertThat(cancelled.status()).isEqualTo("cancelled");
        assertThat(cancelled.replayed()).isFalse();
        assertThat(replayed.replayed()).isTrue();
        assertThat(jdbc.queryForObject("SELECT stock FROM products WHERE id = ?", Integer.class, productId)).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT status FROM stock_reservations WHERE order_id = ?", String.class, created.orderId()))
                .isEqualTo("released");
    }

    private Callable<Outcome> place(int buyerId, PlaceOrderCommand command, String key) {
        return () -> {
            try {
                orders.placeOrder(buyerId, command, key);
                return new Outcome(true, null);
            } catch (RuntimeException exception) {
                return new Outcome(false, exception);
            }
        };
    }

    private int product(String name, String price, int stock) {
        return jdbc.queryForObject(
                """
                        INSERT INTO products (seller_id, name, description, price, stock, category_id, image_url, created_at)
                        VALUES (2, ?, '', ?, ?, 1, '', CURRENT_TIMESTAMP)
                        RETURNING id
                        """,
                Integer.class,
                name, new java.math.BigDecimal(price), stock
        );
    }

    private record Outcome(boolean success, RuntimeException failure) {
    }
}
