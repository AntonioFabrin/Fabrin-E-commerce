package com.fabrinmarket.catalog.adapter.in.web;

import com.fabrinmarket.catalog.application.model.ProductPage;
import com.fabrinmarket.catalog.application.model.ProductView;
import com.fabrinmarket.catalog.application.port.in.CreateProductUseCase;
import com.fabrinmarket.catalog.application.port.in.DeleteProductUseCase;
import com.fabrinmarket.catalog.application.port.in.GetProductUseCase;
import com.fabrinmarket.catalog.application.port.in.ListOwnProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.ListProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.UpdateProductUseCase;
import com.fabrinmarket.catalog.domain.exception.ProductNotFoundException;
import com.fabrinmarket.identity.adapter.in.security.IdentityPrincipal;
import com.fabrinmarket.identity.adapter.in.security.SecurityErrorWriter;
import com.fabrinmarket.identity.application.port.out.TokenProviderPort;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {ProductController.class, CatalogExceptionHandler.class})
@AutoConfigureMockMvc(addFilters = false)
class CatalogWebContractTests {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ListProductsUseCase listProducts;
    @MockitoBean
    private GetProductUseCase getProduct;
    @MockitoBean
    private ListOwnProductsUseCase listOwnProducts;
    @MockitoBean
    private CreateProductUseCase createProduct;
    @MockitoBean
    private UpdateProductUseCase updateProduct;
    @MockitoBean
    private DeleteProductUseCase deleteProduct;
    @MockitoBean
    private TokenProviderPort tokenProvider;
    @MockitoBean
    private SecurityErrorWriter securityErrorWriter;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void preservesThePublicListEnvelopeAndSnakeCaseFields() throws Exception {
        given(listProducts.listProducts(2, 10)).willReturn(new ProductPage(List.of(product()), 2, 10, 21));

        mvc.perform(get("/api/products?page=2&limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dados[0].seller_id").value(7))
                .andExpect(jsonPath("$.dados[0].category_id").value(1))
                .andExpect(jsonPath("$.dados[0].image_url").value("/uploads/products/7/photo.png"))
                .andExpect(jsonPath("$.paginacao.pagina_atual").value(2))
                .andExpect(jsonPath("$.paginacao.itens_por_pagina").value(10))
                .andExpect(jsonPath("$.paginacao.total_de_itens").value(21))
                .andExpect(jsonPath("$.paginacao.total_de_paginas").value(3));
    }

    @Test
    void exposesPublicDetailAndAuthenticatedSellerList() throws Exception {
        given(getProduct.getProduct(12)).willReturn(product());
        given(listOwnProducts.listOwnProducts(7)).willReturn(List.of(product()));

        mvc.perform(get("/api/products/12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(12));

        authenticateAs(7, UserRole.SELLER);
        mvc.perform(get("/api/products/seller"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].seller_id").value(7));
    }

    @Test
    void acceptsLegacyMultipartCreationAndReturnsCompatibleMessage() throws Exception {
        given(createProduct.createProduct(eq(7), any(), any())).willReturn(12);
        authenticateAs(7, UserRole.SELLER);

        mvc.perform(multipart("/api/products")
                        .file(image())
                        .param("name", "Camiseta")
                        .param("description", "Algodão")
                        .param("price", "49.90")
                        .param("stock", "5")
                        .param("category_id", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensagem").value("Produto anunciado com sucesso!"))
                .andExpect(jsonPath("$.produtoId").value(12));
    }

    @Test
    void acceptsMultipartUpdateWithoutReplacementImageAndDelete() throws Exception {
        given(updateProduct.updateProduct(eq(7), eq(12), any(), eq(null))).willReturn(product());
        authenticateAs(7, UserRole.SELLER);

        mvc.perform(multipart("/api/products/12")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .param("name", "Camiseta atualizada")
                        .param("description", "")
                        .param("price", "59.90")
                        .param("stock", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem").value("Produto atualizado com sucesso no Marketplace!"));

        mvc.perform(delete("/api/products/12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem").value("Produto removido da loja com sucesso!"));
        verify(deleteProduct).deleteProduct(7, 12);
    }

    @Test
    void mapsCatalogErrorsAndMalformedParametersWithoutLeakingInternals() throws Exception {
        given(getProduct.getProduct(999)).willThrow(new ProductNotFoundException());

        mvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Produto não encontrado na nossa loja."))
                .andExpect(jsonPath("$.codigo").value("PRODUCT_NOT_FOUND"));

        mvc.perform(get("/api/products?page=abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("INVALID_PRODUCT_DATA"));
    }

    private MockMultipartFile image() {
        return new MockMultipartFile(
                "image",
                "photo.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );
    }

    private void authenticateAs(int id, UserRole role) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                new IdentityPrincipal(id, role),
                null,
                List.of(() -> "ROLE_" + role.name())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private ProductView product() {
        return new ProductView(
                12,
                7,
                "Camiseta",
                "Algodão",
                new BigDecimal("49.90"),
                5,
                1,
                "/uploads/products/7/photo.png",
                LocalDateTime.of(2026, 8, 20, 12, 0)
        );
    }
}
