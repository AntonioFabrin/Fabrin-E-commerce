package com.fabrinmarket.orders.adapter.in.web;

import com.fabrinmarket.identity.adapter.in.security.IdentityPrincipal;
import com.fabrinmarket.orders.adapter.in.web.dto.CreateOrderRequest;
import com.fabrinmarket.orders.adapter.in.web.dto.OrderCreatedResponse;
import com.fabrinmarket.orders.adapter.in.web.dto.OrderResponse;
import com.fabrinmarket.orders.adapter.in.web.dto.OrderCancelledResponse;
import com.fabrinmarket.orders.application.port.in.CancelOrderUseCase;
import com.fabrinmarket.orders.application.port.in.ListBuyerOrdersUseCase;
import com.fabrinmarket.orders.application.port.in.ListSellerOrdersUseCase;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.PlaceOrderCommand;
import com.fabrinmarket.orders.application.port.in.PlaceOrderUseCase.RequestedItem;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final PlaceOrderUseCase placeOrder;
    private final CancelOrderUseCase cancelOrder;
    private final ListBuyerOrdersUseCase listBuyerOrders;
    private final ListSellerOrdersUseCase listSellerOrders;

    public OrderController(
            PlaceOrderUseCase placeOrder,
            CancelOrderUseCase cancelOrder,
            ListBuyerOrdersUseCase listBuyerOrders,
            ListSellerOrdersUseCase listSellerOrders
    ) {
        this.placeOrder = placeOrder;
        this.cancelOrder = cancelOrder;
        this.listBuyerOrders = listBuyerOrders;
        this.listSellerOrders = listSellerOrders;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderCreatedResponse create(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody CreateOrderRequest request
    ) {
        var command = new PlaceOrderCommand(request == null ? List.of() : request.items().stream()
                .map(item -> new RequestedItem(item.productId(), item.quantity()))
                .toList());
        return OrderCreatedResponse.from(placeOrder.placeOrder(principal.userId(), command, idempotencyKey));
    }

    @GetMapping("/my")
    public List<OrderResponse> myOrders(@AuthenticationPrincipal IdentityPrincipal principal) {
        return listBuyerOrders.listBuyerOrders(principal.userId()).stream().map(OrderResponse::from).toList();
    }

    @GetMapping("/seller")
    public List<OrderResponse> sellerOrders(@AuthenticationPrincipal IdentityPrincipal principal) {
        return listSellerOrders.listSellerOrders(principal.userId()).stream().map(OrderResponse::from).toList();
    }

    @PatchMapping("/{id:\\d+}/cancel")
    public OrderCancelledResponse cancel(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id
    ) {
        return OrderCancelledResponse.from(cancelOrder.cancelOrder(principal.userId(), id));
    }
}
