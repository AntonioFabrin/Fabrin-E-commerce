package com.fabrinmarket.catalog.adapter.in.web;

import com.fabrinmarket.catalog.adapter.in.web.dto.CatalogMessageResponse;
import com.fabrinmarket.catalog.adapter.in.web.dto.ProductCreatedResponse;
import com.fabrinmarket.catalog.adapter.in.web.dto.ProductPageResponse;
import com.fabrinmarket.catalog.adapter.in.web.dto.ProductResponse;
import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.port.in.CreateProductUseCase;
import com.fabrinmarket.catalog.application.port.in.CreateProductUseCase.CreateProductCommand;
import com.fabrinmarket.catalog.application.port.in.DeleteProductUseCase;
import com.fabrinmarket.catalog.application.port.in.GetProductUseCase;
import com.fabrinmarket.catalog.application.port.in.ListOwnProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.ListProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.UpdateProductUseCase;
import com.fabrinmarket.catalog.application.port.in.UpdateProductUseCase.UpdateProductCommand;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import com.fabrinmarket.identity.adapter.in.security.IdentityPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ListProductsUseCase listProducts;
    private final GetProductUseCase getProduct;
    private final ListOwnProductsUseCase listOwnProducts;
    private final CreateProductUseCase createProduct;
    private final UpdateProductUseCase updateProduct;
    private final DeleteProductUseCase deleteProduct;

    public ProductController(
            ListProductsUseCase listProducts,
            GetProductUseCase getProduct,
            ListOwnProductsUseCase listOwnProducts,
            CreateProductUseCase createProduct,
            UpdateProductUseCase updateProduct,
            DeleteProductUseCase deleteProduct
    ) {
        this.listProducts = listProducts;
        this.getProduct = getProduct;
        this.listOwnProducts = listOwnProducts;
        this.createProduct = createProduct;
        this.updateProduct = updateProduct;
        this.deleteProduct = deleteProduct;
    }

    @GetMapping
    public ProductPageResponse list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ProductPageResponse.from(listProducts.listProducts(page, limit));
    }

    @GetMapping("/seller")
    public List<ProductResponse> sellerProducts(@AuthenticationPrincipal IdentityPrincipal principal) {
        return listOwnProducts.listOwnProducts(principal.userId()).stream().map(ProductResponse::from).toList();
    }

    @GetMapping("/{id:\\d+}")
    public ProductResponse detail(@PathVariable Integer id) {
        return ProductResponse.from(getProduct.getProduct(id));
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductCreatedResponse create(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @RequestParam String name,
            @RequestParam(defaultValue = "") String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam(name = "category_id", required = false) Integer categoryId,
            @RequestParam(name = "image", required = false) MultipartFile image
    ) {
        var productId = createProduct.createProduct(
                principal.userId(),
                new CreateProductCommand(name, description, price, stock, categoryId),
                imageContent(image)
        );
        return new ProductCreatedResponse("Produto anunciado com sucesso!", productId);
    }

    @PutMapping(path = "/{id:\\d+}", consumes = "multipart/form-data")
    public CatalogMessageResponse update(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id,
            @RequestParam String name,
            @RequestParam(defaultValue = "") String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam(name = "category_id", required = false) Integer categoryId,
            @RequestParam(name = "image", required = false) MultipartFile image
    ) {
        updateProduct.updateProduct(
                principal.userId(),
                id,
                new UpdateProductCommand(name, description, price, stock, categoryId),
                imageContent(image)
        );
        return new CatalogMessageResponse("Produto atualizado com sucesso no Marketplace!");
    }

    @DeleteMapping("/{id:\\d+}")
    public CatalogMessageResponse delete(
            @AuthenticationPrincipal IdentityPrincipal principal,
            @PathVariable Integer id
    ) {
        deleteProduct.deleteProduct(principal.userId(), id);
        return new CatalogMessageResponse("Produto removido da loja com sucesso!");
    }

    private ProductImageContent imageContent(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        try {
            return new ProductImageContent(image.getOriginalFilename(), image.getContentType(), image.getBytes());
        } catch (IOException exception) {
            throw new InvalidProductImageException("Não foi possível ler a imagem do produto.");
        }
    }
}
