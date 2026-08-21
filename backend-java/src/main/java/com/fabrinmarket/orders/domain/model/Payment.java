package com.fabrinmarket.orders.domain.model;

import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderStateException;

import java.time.LocalDateTime;
import java.util.Objects;

public record Payment(
        Integer id,
        Integer orderId,
        String provider,
        String providerPaymentId,
        Money amount,
        PaymentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public Payment {
        if (orderId == null || orderId <= 0) {
            throw new InvalidOrderDataException("O pedido do pagamento é obrigatório.");
        }
        provider = normalizeProvider(provider);
        providerPaymentId = providerPaymentId == null ? "" : providerPaymentId.trim();
        if (providerPaymentId.length() > 255) {
            throw new InvalidOrderDataException("O identificador externo do pagamento é inválido.");
        }
        Objects.requireNonNull(amount, "amount is required");
        if (amount.value().signum() <= 0) {
            throw new InvalidOrderDataException("O valor do pagamento deve ser maior que zero.");
        }
        Objects.requireNonNull(status, "status is required");
        Objects.requireNonNull(createdAt, "createdAt is required");
        Objects.requireNonNull(updatedAt, "updatedAt is required");
    }

    public Payment approve(String externalId, LocalDateTime when) {
        if (status == PaymentStatus.APPROVED) {
            return this;
        }
        if (status != PaymentStatus.PENDING) {
            throw new InvalidOrderStateException("Apenas pagamentos pendentes podem ser aprovados.");
        }
        return new Payment(id, orderId, provider, requiredExternalId(externalId), amount, PaymentStatus.APPROVED, createdAt,
                Objects.requireNonNull(when, "when is required"));
    }

    public Payment reject(String externalId, LocalDateTime when) {
        if (status == PaymentStatus.REJECTED) {
            return this;
        }
        if (status != PaymentStatus.PENDING) {
            throw new InvalidOrderStateException("Apenas pagamentos pendentes podem ser recusados.");
        }
        return new Payment(id, orderId, provider, requiredExternalId(externalId), amount, PaymentStatus.REJECTED, createdAt,
                Objects.requireNonNull(when, "when is required"));
    }

    private static String normalizeProvider(String provider) {
        if (provider == null || provider.isBlank()) {
            throw new InvalidOrderDataException("O provedor de pagamento é obrigatório.");
        }
        var normalized = provider.trim().toLowerCase(java.util.Locale.ROOT);
        if (!normalized.matches("[a-z0-9_-]{2,50}")) {
            throw new InvalidOrderDataException("O provedor de pagamento é inválido.");
        }
        return normalized;
    }

    private static String requiredExternalId(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidOrderDataException("O identificador externo do pagamento é obrigatório.");
        }
        return value.trim();
    }
}
