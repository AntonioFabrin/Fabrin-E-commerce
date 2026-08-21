package com.fabrinmarket.catalog.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fabrinmarket.catalog.application.model.ProductPage;

import java.util.List;

public record ProductPageResponse(
        List<ProductResponse> dados,
        PaginacaoResponse paginacao
) {
    public static ProductPageResponse from(ProductPage page) {
        return new ProductPageResponse(
                page.items().stream().map(ProductResponse::from).toList(),
                new PaginacaoResponse(page.page(), page.limit(), page.totalItems(), page.totalPages())
        );
    }

    public record PaginacaoResponse(
            @JsonProperty("pagina_atual") int currentPage,
            @JsonProperty("itens_por_pagina") int itemsPerPage,
            @JsonProperty("total_de_itens") long totalItems,
            @JsonProperty("total_de_paginas") int totalPages
    ) {
    }
}
