package com.fabrinmarket.catalog.application.model;

import java.util.List;

public record ProductPage(List<ProductView> items, int page, int limit, long totalItems) {

    public ProductPage {
        items = List.copyOf(items);
    }

    public int totalPages() {
        return totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / limit);
    }
}
