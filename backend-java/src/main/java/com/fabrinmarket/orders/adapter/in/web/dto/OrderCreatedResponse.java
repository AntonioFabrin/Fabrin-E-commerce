package com.fabrinmarket.orders.adapter.in.web.dto;

import com.fabrinmarket.orders.application.model.OrderPlacementResult;

import java.math.BigDecimal;

public record OrderCreatedResponse(
        String mensagem,
        Integer pedido_id,
        BigDecimal valor_total,
        String referencia,
        String status,
        boolean repetido
) {
    public static OrderCreatedResponse from(OrderPlacementResult result) {
        return new OrderCreatedResponse(
                "Pedido realizado com sucesso!", result.orderId(), result.total(), result.reference(), result.status(), result.replayed()
        );
    }
}
