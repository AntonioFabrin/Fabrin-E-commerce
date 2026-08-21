package com.fabrinmarket.orders.application.service;

import com.fabrinmarket.orders.application.model.OrderListEntry;
import com.fabrinmarket.orders.application.port.in.ListBuyerOrdersUseCase;
import com.fabrinmarket.orders.application.port.in.ListSellerOrdersUseCase;
import com.fabrinmarket.orders.application.port.out.OrderActorRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderQueryRepositoryPort;
import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.OrderForbiddenOperationException;

import java.util.List;

public class OrderQueryService implements ListBuyerOrdersUseCase, ListSellerOrdersUseCase {

    private final OrderQueryRepositoryPort queries;
    private final OrderActorRepositoryPort actors;

    public OrderQueryService(OrderQueryRepositoryPort queries, OrderActorRepositoryPort actors) {
        this.queries = queries;
        this.actors = actors;
    }

    @Override
    public List<OrderListEntry> listBuyerOrders(Integer buyerId) {
        validateActor(buyerId);
        return queries.findByBuyerId(buyerId);
    }

    @Override
    public List<OrderListEntry> listSellerOrders(Integer sellerId) {
        validateActor(sellerId);
        if (!actors.isCurrentSellerOrAdmin(sellerId)) {
            throw new OrderForbiddenOperationException("Apenas vendedores podem consultar pedidos recebidos.");
        }
        return queries.findBySellerId(sellerId);
    }

    private void validateActor(Integer actorId) {
        if (actorId == null || actorId <= 0) {
            throw new InvalidOrderDataException("Usuário não identificado.");
        }
    }
}
