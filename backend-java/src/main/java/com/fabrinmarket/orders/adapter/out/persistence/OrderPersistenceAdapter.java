package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.port.out.OrderRepositoryPort;
import com.fabrinmarket.orders.domain.model.Money;
import com.fabrinmarket.orders.domain.model.Order;
import com.fabrinmarket.orders.domain.model.OrderItem;
import com.fabrinmarket.orders.domain.model.OrderReference;
import com.fabrinmarket.orders.domain.model.OrderStatus;
import com.fabrinmarket.orders.domain.exception.OrderPersistenceConflictException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
class OrderPersistenceAdapter implements OrderRepositoryPort {

    private final SpringDataOrderRepository orders;
    private final SpringDataOrderItemRepository items;

    OrderPersistenceAdapter(SpringDataOrderRepository orders, SpringDataOrderItemRepository items) {
        this.orders = orders;
        this.items = items;
    }

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity;
        if (order.id() == null) {
            entity = new OrderJpaEntity(
                    order.buyerId(), order.reference().value(), order.total().value(), order.status().value(),
                    order.idempotencyKey(), order.createdAt()
            );
            try {
                entity = orders.saveAndFlush(entity);
            } catch (DataIntegrityViolationException exception) {
                throw new OrderPersistenceConflictException();
            }
            var orderId = entity.getId();
            items.saveAll(order.items().stream()
                    .map(item -> new OrderItemJpaEntity(orderId, item.productId(), item.quantity(), item.unitPrice().value()))
                    .toList());
        } else {
            entity = orders.findById(order.id()).orElseThrow();
            entity.updateStatus(order.status().value());
            entity = orders.saveAndFlush(entity);
        }
        return toDomain(entity, order.id() == null ? order.items() : itemsFor(entity.getId()));
    }

    @Override
    public Optional<Order> findByBuyerIdAndIdempotencyKey(Integer buyerId, String idempotencyKey) {
        return orders.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey)
                .map(entity -> toDomain(entity, itemsFor(entity.getId())));
    }

    @Override
    public Optional<Order> findById(Integer orderId) {
        return orders.findById(orderId).map(entity -> toDomain(entity, itemsFor(entity.getId())));
    }

    private List<OrderItem> itemsFor(Integer orderId) {
        return items.findByOrderIdOrderByIdAsc(orderId).stream()
                .map(item -> new OrderItem(item.getProductId(), item.getQuantity(), Money.unitPrice(item.getPrice())))
                .toList();
    }

    private Order toDomain(OrderJpaEntity entity, List<OrderItem> orderItems) {
        return new Order(
                entity.getId(), new OrderReference(entity.getReference()), entity.getBuyerId(), orderItems,
                new Money(entity.getTotal()), OrderStatus.from(entity.getStatus()), entity.getIdempotencyKey(), entity.getCreatedAt()
        );
    }
}
