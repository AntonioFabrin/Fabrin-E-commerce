package com.fabrinmarket.orders.domain;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderStateException;
import com.fabrinmarket.orders.domain.model.Money;
import com.fabrinmarket.orders.domain.model.Order;
import com.fabrinmarket.orders.domain.model.OrderItem;
import com.fabrinmarket.orders.domain.model.OrderReference;
import com.fabrinmarket.orders.domain.model.OrderStatus;
import com.fabrinmarket.orders.domain.model.StockReservation;
import com.fabrinmarket.orders.domain.model.StockReservationStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderDomainTests {

    @Test
    void calculatesExactMonetaryTotalWithoutFloatingPointArithmetic() {
        var item = new OrderItem(10, 3, Money.unitPrice(new BigDecimal("19.90")));
        var order = order(List.of(item), new Money(new BigDecimal("59.70")));

        assertThat(item.subtotal().value()).isEqualByComparingTo("59.70");
        assertThat(order.total().value()).isEqualByComparingTo("59.70");
    }

    @Test
    void rejectsTotalsThatDoNotMatchThePersistedItemSnapshots() {
        assertThatThrownBy(() -> order(
                List.of(new OrderItem(10, 2, Money.unitPrice(new BigDecimal("19.90")))),
                new Money(new BigDecimal("20.00"))
        )).isInstanceOf(InvalidOrderDataException.class);
    }

    @Test
    void permitsOnlyExpectedOrderAndReservationTransitions() {
        var pending = order(List.of(new OrderItem(10, 1, Money.unitPrice(new BigDecimal("10.00")))), new Money(new BigDecimal("10.00")));
        assertThat(pending.markPaid().status()).isEqualTo(OrderStatus.PAID);
        assertThatThrownBy(() -> pending.markPaid().cancel()).isInstanceOf(InvalidOrderStateException.class);

        var reservation = new StockReservation(1L, 1, 10, 1, StockReservationStatus.RESERVED, LocalDateTime.now(), null);
        assertThat(reservation.release(LocalDateTime.now()).status()).isEqualTo(StockReservationStatus.RELEASED);
        assertThatThrownBy(() -> reservation.consume().release(LocalDateTime.now()))
                .isInstanceOf(InvalidOrderStateException.class);
    }

    @Test
    void rejectsDecimalsBeyondCentsAndInvalidReferences() {
        assertThatThrownBy(() -> Money.unitPrice(new BigDecimal("1.001"))).isInstanceOf(InvalidOrderDataException.class);
        assertThatThrownBy(() -> new OrderReference("invalid reference")).isInstanceOf(InvalidOrderDataException.class);
    }

    private Order order(List<OrderItem> items, Money total) {
        return new Order(
                1,
                new OrderReference("ORD-12345678-1234-1234-1234-123456789ABC"),
                2,
                items,
                total,
                OrderStatus.PENDING,
                "order-domain-test-key",
                LocalDateTime.now()
        );
    }
}
