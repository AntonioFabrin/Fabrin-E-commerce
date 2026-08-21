package com.fabrinmarket.orders.application.service;

import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.PlaceOrderCommand;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.RequestedItem;
import com.fabrinmarket.orders.application.port.out.OrderProductRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderTransactionPort;
import com.fabrinmarket.orders.application.port.out.StockReservationRepositoryPort;
import com.fabrinmarket.orders.domain.exception.IdempotencyConflictException;
import com.fabrinmarket.orders.domain.exception.InsufficientStockException;
import com.fabrinmarket.orders.domain.model.Order;
import com.fabrinmarket.orders.domain.model.StockReservation;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderServiceTests {

    private final InMemoryOrders orders = new InMemoryOrders();
    private final InMemoryProducts products = new InMemoryProducts();
    private final InMemoryReservations reservations = new InMemoryReservations();
    private final OrderService service = new OrderService(
            orders, reservations, products, new ImmediateTransaction(),
            Clock.fixed(Instant.parse("2026-08-21T00:00:00Z"), ZoneOffset.UTC)
    );

    @Test
    void getsPricesFromLockedDatabaseProductsConsolidatesItemsAndReservesStock() {
        products.put(10, 3, "Produto A", "19.90");

        var result = service.placeOrder(7, new PlaceOrderCommand(List.of(
                new RequestedItem(10, 1), new RequestedItem(10, 2)
        )), "checkout-1");

        assertThat(result.total()).isEqualByComparingTo("59.70");
        assertThat(result.reference()).startsWith("ORD-");
        assertThat(result.replayed()).isFalse();
        assertThat(products.stock(10)).isZero();
        assertThat(reservations.values).singleElement().satisfies(reservation -> {
            assertThat(reservation.productId()).isEqualTo(10);
            assertThat(reservation.quantity()).isEqualTo(3);
        });
    }

    @Test
    void replaysIdenticalRequestsWithoutDuplicatingStockReservation() {
        products.put(10, 4, "Produto A", "19.90");
        var command = new PlaceOrderCommand(List.of(new RequestedItem(10, 2)));

        var first = service.placeOrder(7, command, "checkout-retry");
        var replay = service.placeOrder(7, command, "checkout-retry");

        assertThat(replay.orderId()).isEqualTo(first.orderId());
        assertThat(replay.replayed()).isTrue();
        assertThat(products.stock(10)).isEqualTo(2);
        assertThat(reservations.values).hasSize(1);
    }

    @Test
    void rejectsChangedPayloadForTheSameIdempotencyKey() {
        products.put(10, 5, "Produto A", "10.00");
        products.put(11, 5, "Produto B", "20.00");
        service.placeOrder(7, new PlaceOrderCommand(List.of(new RequestedItem(10, 1))), "same-key");

        assertThatThrownBy(() -> service.placeOrder(
                7, new PlaceOrderCommand(List.of(new RequestedItem(11, 1))), "same-key"
        )).isInstanceOf(IdempotencyConflictException.class);
        assertThat(products.stock(11)).isEqualTo(5);
    }

    @Test
    void rejectsInsufficientStockBeforePersistingAnyOrderOrReservation() {
        products.put(10, 1, "Produto A", "10.00");

        assertThatThrownBy(() -> service.placeOrder(
                7, new PlaceOrderCommand(List.of(new RequestedItem(10, 2))), "insufficient-stock"
        )).isInstanceOf(InsufficientStockException.class);

        assertThat(orders.values).isEmpty();
        assertThat(reservations.values).isEmpty();
        assertThat(products.stock(10)).isEqualTo(1);
    }

    private static final class ImmediateTransaction implements OrderTransactionPort {
        @Override
        public <T> T execute(java.util.function.Supplier<T> action) {
            return action.get();
        }
    }

    private static final class InMemoryOrders implements OrderRepositoryPort {
        private final List<Order> values = new ArrayList<>();

        @Override
        public Order save(Order order) {
            var saved = new Order(values.size() + 1, order.reference(), order.buyerId(), order.items(), order.total(),
                    order.status(), order.idempotencyKey(), order.createdAt());
            values.add(saved);
            return saved;
        }

        @Override
        public Optional<Order> findByBuyerIdAndIdempotencyKey(Integer buyerId, String key) {
            return values.stream().filter(order -> order.buyerId().equals(buyerId) && order.idempotencyKey().equals(key)).findFirst();
        }

        @Override
        public Optional<Order> findById(Integer orderId) {
            return values.stream().filter(order -> order.id().equals(orderId)).findFirst();
        }
    }

    private static final class InMemoryReservations implements StockReservationRepositoryPort {
        private final List<StockReservation> values = new ArrayList<>();

        @Override
        public List<StockReservation> saveAll(List<StockReservation> newValues) {
            var saved = newValues.stream()
                    .map(value -> new StockReservation((long) values.size() + 1, value.orderId(), value.productId(), value.quantity(),
                            value.status(), value.createdAt(), value.releasedAt()))
                    .toList();
            values.addAll(saved);
            return saved;
        }

        @Override
        public List<StockReservation> findByOrderId(Integer orderId) {
            return values.stream().filter(value -> value.orderId().equals(orderId)).toList();
        }
    }

    private static final class InMemoryProducts implements OrderProductRepositoryPort {
        private final Map<Integer, MutableProduct> values = new HashMap<>();

        void put(int id, int stock, String name, String price) {
            values.put(id, new MutableProduct(id, 3, name, new BigDecimal(price), stock, ""));
        }

        int stock(int id) {
            return values.get(id).stock;
        }

        @Override
        public Optional<OrderProductSnapshot> findByIdForUpdate(Integer productId) {
            var product = values.get(productId);
            return product == null ? Optional.empty() : Optional.of(product.snapshot());
        }

        @Override
        public boolean decreaseStock(Integer productId, int quantity) {
            var product = values.get(productId);
            if (product == null || product.stock < quantity) {
                return false;
            }
            product.stock -= quantity;
            return true;
        }

        @Override
        public void increaseStock(Integer productId, int quantity) {
            values.get(productId).stock += quantity;
        }

        private static final class MutableProduct {
            private final int id;
            private final int sellerId;
            private final String name;
            private final BigDecimal price;
            private int stock;
            private final String imageUrl;

            private MutableProduct(int id, int sellerId, String name, BigDecimal price, int stock, String imageUrl) {
                this.id = id;
                this.sellerId = sellerId;
                this.name = name;
                this.price = price;
                this.stock = stock;
                this.imageUrl = imageUrl;
            }

            private OrderProductSnapshot snapshot() {
                return new OrderProductSnapshot(id, sellerId, name, price, stock, imageUrl);
            }
        }
    }
}
