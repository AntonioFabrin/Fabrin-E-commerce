package com.fabrinmarket.orders.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.List;

public record CreateOrderRequest(List<ItemRequest> items) {
    public record ItemRequest(@JsonAlias("product_id") Integer productId, Integer quantity) {
    }
}
