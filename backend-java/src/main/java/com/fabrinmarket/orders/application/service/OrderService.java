package com.fabrinmarket.orders.application.service;

import com.fabrinmarket.orders.application.model.OrderPlacementResult;
import com.fabrinmarket.orders.application.model.OrderCancellationResult;
import com.fabrinmarket.orders.application.port.in.CancelOrderUseCase;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase;
import com.fabrinmarket.orders.application.port.out.OrderProductRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderTransactionPort;
import com.fabrinmarket.orders.application.port.out.StockReservationRepositoryPort;
import com.fabrinmarket.orders.domain.exception.IdempotencyConflictException;
import com.fabrinmarket.orders.domain.exception.InsufficientStockException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.OrderPersistenceConflictException;
import com.fabrinmarket.orders.domain.exception.OrderProductNotFoundException;
import com.fabrinmarket.orders.domain.exception.OrderNotFoundException;
import com.fabrinmarket.orders.domain.exception.OrderForbiddenOperationException;
import com.fabrinmarket.orders.domain.model.Money;
import com.fabrinmarket.orders.domain.model.Order;
import com.fabrinmarket.orders.domain.model.OrderItem;
import com.fabrinmarket.orders.domain.model.OrderReference;
import com.fabrinmarket.orders.domain.model.OrderStatus;
import com.fabrinmarket.orders.domain.model.StockReservation;
import com.fabrinmarket.orders.domain.model.StockReservationStatus;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class OrderService implements PlaceOrderUseCase, CancelOrderUseCase {

    private final OrderRepositoryPort orders;
    private final StockReservationRepositoryPort reservations;
    private final OrderProductRepositoryPort products;
    private final OrderTransactionPort transactions;
    private final Clock clock;

    public OrderService(
            OrderRepositoryPort orders,
            StockReservationRepositoryPort reservations,
            OrderProductRepositoryPort products,
            OrderTransactionPort transactions,
            Clock clock
    ) {
        this.orders = orders;
        this.reservations = reservations;
        this.products = products;
        this.transactions = transactions;
        this.clock = clock;
    }

    @Override
    public OrderPlacementResult placeOrder(Integer buyerId, PlaceOrderCommand command, String idempotencyKey) {
        validateBuyer(buyerId);
        var normalizedKey = normalizeIdempotencyKey(idempotencyKey);
        var requestedItems = consolidate(command);

        try {
            return transactions.execute(() -> placeAtomically(buyerId, requestedItems, normalizedKey));
        } catch (OrderPersistenceConflictException exception) {
            var persisted = orders.findByBuyerIdAndIdempotencyKey(buyerId, normalizedKey);
            if (persisted.isPresent()) {
                assertSameRequest(persisted.get(), requestedItems);
                return OrderPlacementResult.from(persisted.get(), true);
            }
            throw exception;
        }
    }

    private OrderPlacementResult placeAtomically(Integer buyerId, List<RequestedItem> requestedItems, String idempotencyKey) {
        var existing = orders.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey);
        if (existing.isPresent()) {
            assertSameRequest(existing.get(), requestedItems);
            return OrderPlacementResult.from(existing.get(), true);
        }

        var lockedProducts = requestedItems.stream()
                .sorted(Comparator.comparing(RequestedItem::productId))
                .map(item -> new LockedRequestedItem(item, products.findByIdForUpdate(item.productId())
                        .orElseThrow(() -> new OrderProductNotFoundException(item.productId()))))
                .toList();

        // A concurrent order using the same product waits on the pessimistic lock. Rechecking afterwards
        // makes an identical retry return the original order rather than attempting another reservation.
        existing = orders.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey);
        if (existing.isPresent()) {
            assertSameRequest(existing.get(), requestedItems);
            return OrderPlacementResult.from(existing.get(), true);
        }

        for (var item : lockedProducts) {
            if (item.product.stock() < item.request.quantity()) {
                throw new InsufficientStockException(item.product.name());
            }
        }

        var orderItems = lockedProducts.stream()
                .map(item -> new OrderItem(item.product.id(), item.request.quantity(), Money.unitPrice(item.product.price())))
                .toList();
        var total = orderItems.stream().map(OrderItem::subtotal).reduce(new Money(BigDecimal.ZERO), Money::plus);
        var now = LocalDateTime.now(clock);
        var savedOrder = orders.save(new Order(
                null, OrderReference.newReference(), buyerId, orderItems, total, OrderStatus.PENDING, idempotencyKey, now
        ));

        for (var item : lockedProducts) {
            if (!products.decreaseStock(item.product.id(), item.request.quantity())) {
                throw new InsufficientStockException(item.product.name());
            }
        }

        reservations.saveAll(lockedProducts.stream()
                .map(item -> new StockReservation(
                        null, savedOrder.id(), item.product.id(), item.request.quantity(), StockReservationStatus.RESERVED, now, null
                ))
                .toList());
        return OrderPlacementResult.from(savedOrder, false);
    }

    @Override
    public OrderCancellationResult cancelOrder(Integer buyerId, Integer orderId) {
        validateBuyer(buyerId);
        if (orderId == null || orderId <= 0) {
            throw new InvalidOrderDataException("O identificador do pedido é inválido.");
        }
        return transactions.execute(() -> cancelAtomically(buyerId, orderId));
    }

    private OrderCancellationResult cancelAtomically(Integer buyerId, Integer orderId) {
        var order = orders.findById(orderId).orElseThrow(() -> new OrderNotFoundException(orderId));
        if (!order.buyerId().equals(buyerId)) {
            throw new OrderForbiddenOperationException("Você não pode cancelar este pedido.");
        }
        if (order.status() == OrderStatus.CANCELLED) {
            return OrderCancellationResult.from(order, true);
        }

        var orderReservations = reservations.findByOrderId(orderId);
        if (orderReservations.isEmpty()) {
            throw new InvalidOrderDataException("O pedido não possui reservas de estoque para liberar.");
        }
        var lockedReservations = orderReservations.stream()
                .sorted(Comparator.comparing(StockReservation::productId))
                .map(reservation -> new LockedReservation(reservation, products.findByIdForUpdate(reservation.productId())
                        .orElseThrow(() -> new OrderProductNotFoundException(reservation.productId()))))
                .toList();

        var cancelled = orders.save(order.cancel());
        var now = LocalDateTime.now(clock);
        for (var item : lockedReservations) {
            products.increaseStock(item.product.id(), item.reservation.quantity());
        }
        reservations.saveAll(lockedReservations.stream().map(item -> item.reservation.release(now)).toList());
        return OrderCancellationResult.from(cancelled, false);
    }

    private List<RequestedItem> consolidate(PlaceOrderCommand command) {
        if (command == null || command.items().isEmpty()) {
            throw new InvalidOrderDataException("O carrinho está vazio.");
        }
        Map<Integer, Integer> quantities = new LinkedHashMap<>();
        for (var item : command.items()) {
            if (item == null || item.productId() == null || item.productId() <= 0) {
                throw new InvalidOrderDataException("Cada item deve informar um productId positivo.");
            }
            if (item.quantity() == null || item.quantity() <= 0 || item.quantity() > 1_000_000) {
                throw new InvalidOrderDataException("Cada item deve informar uma quantidade entre 1 e 1000000.");
            }
            quantities.merge(item.productId(), item.quantity(), Math::addExact);
        }
        return quantities.entrySet().stream()
                .map(entry -> new RequestedItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    private void assertSameRequest(Order order, List<RequestedItem> requestedItems) {
        var persisted = order.items().stream()
                .collect(java.util.stream.Collectors.toMap(OrderItem::productId, OrderItem::quantity));
        var requested = requestedItems.stream()
                .collect(java.util.stream.Collectors.toMap(RequestedItem::productId, RequestedItem::quantity));
        if (!persisted.equals(requested)) {
            throw new IdempotencyConflictException();
        }
    }

    private void validateBuyer(Integer buyerId) {
        if (buyerId == null || buyerId <= 0) {
            throw new InvalidOrderDataException("O comprador do pedido é obrigatório.");
        }
    }

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new InvalidOrderDataException("O cabeçalho Idempotency-Key é obrigatório.");
        }
        var normalized = idempotencyKey.trim();
        if (normalized.length() > 128) {
            throw new InvalidOrderDataException("O cabeçalho Idempotency-Key excede o limite permitido.");
        }
        return normalized;
    }

    private record LockedRequestedItem(RequestedItem request, OrderProductRepositoryPort.OrderProductSnapshot product) {
    }

    private record LockedReservation(StockReservation reservation, OrderProductRepositoryPort.OrderProductSnapshot product) {
    }
}
