package com.fabrinmarket.catalog.application.service;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.model.ProductPage;
import com.fabrinmarket.catalog.application.model.ProductView;
import com.fabrinmarket.catalog.application.port.in.CreateProductUseCase;
import com.fabrinmarket.catalog.application.port.in.DeleteProductUseCase;
import com.fabrinmarket.catalog.application.port.in.GetProductUseCase;
import com.fabrinmarket.catalog.application.port.in.ListOwnProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.ListProductsUseCase;
import com.fabrinmarket.catalog.application.port.in.UpdateProductUseCase;
import com.fabrinmarket.catalog.application.port.out.CatalogActorRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import com.fabrinmarket.catalog.application.port.out.ProductCategoryRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductRepositoryPort;
import com.fabrinmarket.catalog.domain.exception.CatalogActorNotFoundException;
import com.fabrinmarket.catalog.domain.exception.CatalogForbiddenOperationException;
import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import com.fabrinmarket.catalog.domain.exception.ProductNotFoundException;
import com.fabrinmarket.catalog.domain.model.CatalogActorRole;
import com.fabrinmarket.catalog.domain.model.Product;
import com.fabrinmarket.catalog.domain.model.ProductDescription;
import com.fabrinmarket.catalog.domain.model.ProductName;
import com.fabrinmarket.catalog.domain.model.ProductPrice;
import com.fabrinmarket.catalog.domain.model.ProductStock;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

public final class CatalogService implements
        ListProductsUseCase,
        GetProductUseCase,
        ListOwnProductsUseCase,
        CreateProductUseCase,
        UpdateProductUseCase,
        DeleteProductUseCase {

    private static final int DEFAULT_CATEGORY_ID = 1;
    private static final int MAXIMUM_PAGE_SIZE = 100;

    private final ProductRepositoryPort products;
    private final CatalogActorRepositoryPort actors;
    private final ProductCategoryRepositoryPort categories;
    private final ProductImageStoragePort images;
    private final Clock clock;

    public CatalogService(
            ProductRepositoryPort products,
            CatalogActorRepositoryPort actors,
            ProductCategoryRepositoryPort categories,
            ProductImageStoragePort images,
            Clock clock
    ) {
        this.products = products;
        this.actors = actors;
        this.categories = categories;
        this.images = images;
        this.clock = clock;
    }

    @Override
    public ProductPage listProducts(int page, int limit) {
        validatePagination(page, limit);
        var slice = products.findPage(page, limit);
        return new ProductPage(slice.items().stream().map(ProductView::from).toList(), page, limit, slice.totalItems());
    }

    @Override
    public ProductView getProduct(Integer productId) {
        return ProductView.from(findProduct(productId));
    }

    @Override
    public List<ProductView> listOwnProducts(Integer actorId) {
        requireCatalogManager(actorId);
        return products.findBySellerId(actorId).stream().map(ProductView::from).toList();
    }

    @Override
    public Integer createProduct(Integer actorId, CreateProductCommand command, ProductImageContent image) {
        requireCatalogManager(actorId);
        if (command == null) {
            throw new InvalidProductDataException("Os dados do produto são obrigatórios.");
        }
        if (image == null) {
            throw new InvalidProductImageException("A imagem do produto é obrigatória.");
        }

        var product = buildProduct(actorId, command, "");
        var storedImage = images.store(actorId, image);
        try {
            return products.save(product.withImageUrl(storedImage)).id();
        } catch (RuntimeException exception) {
            deleteImageQuietly(storedImage);
            throw exception;
        }
    }

    @Override
    public ProductView updateProduct(
            Integer actorId,
            Integer productId,
            UpdateProductCommand command,
            ProductImageContent replacementImage
    ) {
        var role = requireCatalogManager(actorId);
        var current = findProduct(productId);
        authorizeOwnerOrAdmin(actorId, role, current);
        if (command == null) {
            throw new InvalidProductDataException("Os dados do produto são obrigatórios.");
        }

        var updated = current.withDetails(
                new ProductName(command.name()),
                new ProductDescription(command.description()),
                new ProductPrice(command.price()),
                new ProductStock(requiredStock(command.stock())),
                categoryOrDefault(command.categoryId())
        );

        if (replacementImage == null) {
            return ProductView.from(products.save(updated));
        }

        var newImageUrl = images.store(current.sellerId(), replacementImage);
        try {
            var saved = products.save(updated.withImageUrl(newImageUrl));
            deleteImageQuietly(current.imageUrl());
            return ProductView.from(saved);
        } catch (RuntimeException exception) {
            deleteImageQuietly(newImageUrl);
            throw exception;
        }
    }

    @Override
    public void deleteProduct(Integer actorId, Integer productId) {
        var role = requireCatalogManager(actorId);
        var product = findProduct(productId);
        authorizeOwnerOrAdmin(actorId, role, product);
        products.deleteById(product.id());
        deleteImageQuietly(product.imageUrl());
    }

    private Product buildProduct(Integer sellerId, CreateProductCommand command, String imageUrl) {
        return new Product(
                null,
                sellerId,
                new ProductName(command.name()),
                new ProductDescription(command.description()),
                new ProductPrice(command.price()),
                new ProductStock(requiredStock(command.stock())),
                categoryOrDefault(command.categoryId()),
                imageUrl,
                LocalDateTime.now(clock)
        );
    }

    private CatalogActorRole requireCatalogManager(Integer actorId) {
        if (actorId == null || actorId <= 0) {
            throw new CatalogActorNotFoundException();
        }
        var role = actors.findRoleByUserId(actorId).orElseThrow(CatalogActorNotFoundException::new);
        if (!role.canManageCatalog()) {
            throw new CatalogForbiddenOperationException();
        }
        return role;
    }

    private Product findProduct(Integer productId) {
        if (productId == null || productId <= 0) {
            throw new InvalidProductDataException("O ID do produto deve ser um inteiro positivo.");
        }
        return products.findById(productId).orElseThrow(ProductNotFoundException::new);
    }

    private void authorizeOwnerOrAdmin(Integer actorId, CatalogActorRole role, Product product) {
        if (role != CatalogActorRole.ADMIN && !actorId.equals(product.sellerId())) {
            throw new CatalogForbiddenOperationException();
        }
    }

    private void validatePagination(int page, int limit) {
        if (page < 1) {
            throw new InvalidProductDataException("A página deve ser maior ou igual a 1.");
        }
        if (limit < 1 || limit > MAXIMUM_PAGE_SIZE) {
            throw new InvalidProductDataException("O limite deve estar entre 1 e 100.");
        }
    }

    private int requiredStock(Integer stock) {
        if (stock == null) {
            throw new InvalidProductDataException("O estoque é obrigatório.");
        }
        return stock;
    }

    private int categoryOrDefault(Integer categoryId) {
        var selectedCategoryId = categoryId == null ? DEFAULT_CATEGORY_ID : categoryId;
        if (!categories.existsActiveById(selectedCategoryId)) {
            throw new InvalidProductDataException("A categoria informada não existe ou está inativa.");
        }
        return selectedCategoryId;
    }

    private void deleteImageQuietly(String imageUrl) {
        try {
            images.delete(imageUrl);
        } catch (RuntimeException ignored) {
            // A operação principal já foi concluída ou está sendo compensada.
            // Falha de limpeza não deve mascarar o resultado do banco.
        }
    }
}
