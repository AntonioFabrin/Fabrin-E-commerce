package com.fabrinmarket.orders.adapter.in.web.dto;

import com.fabrinmarket.orders.application.model.OrderCancellationResult;

public record OrderCancelledResponse(String mensagem, Integer pedido_id, String status, boolean repetido) {
    public static OrderCancelledResponse from(OrderCancellationResult result) {
        return new OrderCancelledResponse("Pedido cancelado com sucesso!", result.orderId(), result.status(), result.replayed());
    }
}
