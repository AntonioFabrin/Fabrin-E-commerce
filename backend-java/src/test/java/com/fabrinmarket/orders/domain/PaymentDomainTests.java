package com.fabrinmarket.orders.domain;

import com.fabrinmarket.orders.domain.exception.InvalidOrderStateException;
import com.fabrinmarket.orders.domain.model.Money;
import com.fabrinmarket.orders.domain.model.Payment;
import com.fabrinmarket.orders.domain.model.PaymentStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaymentDomainTests {

    @Test
    void permitsOnlyIdempotentTerminalPaymentTransitions() {
        var pending = pending();
        var approved = pending.approve("mp-payment-1", LocalDateTime.now());

        assertThat(approved.status()).isEqualTo(PaymentStatus.APPROVED);
        assertThat(approved.approve("mp-payment-1", LocalDateTime.now())).isSameAs(approved);
        assertThatThrownBy(() -> approved.reject("mp-payment-1", LocalDateTime.now()))
                .isInstanceOf(InvalidOrderStateException.class);
    }

    @Test
    void rejectsInvalidProviderAndNonPositiveAmount() {
        assertThatThrownBy(() -> new Payment(1, 1, "Mercado Pago", "", new Money(new BigDecimal("1.00")),
                PaymentStatus.PENDING, LocalDateTime.now(), LocalDateTime.now())).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> new Payment(1, 1, "mercadopago", "", new Money(BigDecimal.ZERO),
                PaymentStatus.PENDING, LocalDateTime.now(), LocalDateTime.now())).isInstanceOf(RuntimeException.class);
    }

    private Payment pending() {
        return new Payment(1, 1, "mercadopago", "", Money.unitPrice(new BigDecimal("10.00")),
                PaymentStatus.PENDING, LocalDateTime.now(), LocalDateTime.now());
    }
}
