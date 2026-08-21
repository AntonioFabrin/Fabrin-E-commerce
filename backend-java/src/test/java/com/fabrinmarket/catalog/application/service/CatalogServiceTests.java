package com.fabrinmarket.catalog.application.service;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.port.in.CreateProductUseCase.CreateProductCommand;
import com.fabrinmarket.catalog.application.port.in.UpdateProductUseCase.UpdateProductCommand;
import com.fabrinmarket.catalog.application.port.out.CatalogActorRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import com.fabrinmarket.catalog.application.port.out.ProductCategoryRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductRepositoryPort;
import com.fabrinmarket.catalog.domain.exception.CatalogForbiddenOperationException;
import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;
import com.fabrinmarket.catalog.domain.exception.ProductNotFoundException;
import com.fabrinmarket.catalog.domain.model.CatalogActorRole;
import com.fabrinmarket.catalog.domain.model.Product;
import com.fabrinmarket.catalog.domain.model.ProductDescription;
import com.fabrinmarket.catalog.domain.model.ProductName;
import com.fabrinmarket.catalog.domain.model.ProductPrice;
import com.fabrinmarket.catalog.domain.model.ProductStock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CatalogServiceTests {

    private final InMemoryProducts products = new InMemoryProducts();
    private final InMemoryActors actors = new InMemoryActors();
    private final InMemoryCategories categories = new InMemoryCategories();
    private final InMemoryImages images = new InMemoryImages();
    private CatalogService service;

    @BeforeEach
    void setUp() {
        actors.roles.put(10, CatalogActorRole.SELLER);
        actors.roles.put(20, CatalogActorRole.SELLER);
        actors.roles.put(30, CatalogActorRole.ADMIN);
        actors.roles.put(40, CatalogActorRole.CUSTOMER);
        service = new CatalogService(
                products,
                actors,
                categories,
                images,
                Clock.fixed(Instant.parse("2026-08-20T12:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void createsProductForCurrentSellerAndNormalizesValues() {
        var id = service.createProduct(10, createCommand(), image("produto.png"));

        var saved = products.findById(id).orElseThrow();
        assertThat(saved.sellerId()).isEqualTo(10);
        assertThat(saved.name().value()).isEqualTo("Teclado Mecânico");
        assertThat(saved.price().value()).isEqualByComparingTo("299.90");
        assertThat(saved.imageUrl()).startsWith("/uploads/products/10/");
    }

    @Test
    void rejectsCustomerAndStaleSellerBeforeWritingImage() {
        assertThatThrownBy(() -> service.createProduct(40, createCommand(), image("produto.png")))
                .isInstanceOf(CatalogForbiddenOperationException.class);

        actors.roles.put(10, CatalogActorRole.CUSTOMER);
        assertThatThrownBy(() -> service.createProduct(10, createCommand(), image("produto.png")))
                .isInstanceOf(CatalogForbiddenOperationException.class);
        assertThat(images.stored).isEmpty();
    }

    @Test
    void rejectsMissingOrInactiveCategoryBeforeWritingImageOrProduct() {
        var invalidCommand = new CreateProductCommand(
                "Produto inválido",
                "Categoria inexistente",
                new BigDecimal("29.90"),
                3,
                999
        );

        assertThatThrownBy(() -> service.createProduct(10, invalidCommand, image("produto.png")))
                .isInstanceOf(InvalidProductDataException.class)
                .hasMessageContaining("categoria");
        assertThat(images.stored).isEmpty();
        assertThat(products.data).isEmpty();
    }

    @Test
    void compensatesStoredImageWhenRepositoryFails() {
        products.failOnSave = true;

        assertThatThrownBy(() -> service.createProduct(10, createCommand(), image("produto.png")))
                .isInstanceOf(IllegalStateException.class);
        assertThat(images.deleted).containsExactly(images.stored.getFirst());
    }

    @Test
    void validatesPaginationAndMissingProduct() {
        assertThatThrownBy(() -> service.listProducts(0, 50))
                .isInstanceOf(InvalidProductDataException.class);
        assertThatThrownBy(() -> service.listProducts(1, 101))
                .isInstanceOf(InvalidProductDataException.class);
        assertThatThrownBy(() -> service.getProduct(999))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void listsOnlyCurrentSellerProducts() {
        products.save(product(null, 10, "/uploads/products/10/one.png"));
        products.save(product(null, 20, "/uploads/products/20/two.png"));

        assertThat(service.listOwnProducts(10)).extracting("sellerId").containsExactly(10);
    }

    @Test
    void ownerCanReplaceImageAndOldImageIsCleanedAfterSave() {
        var saved = products.save(product(null, 10, "/uploads/products/10/old.png"));

        var updated = service.updateProduct(10, saved.id(), updateCommand(), image("new.webp"));

        assertThat(updated.imageUrl()).isNotEqualTo(saved.imageUrl());
        assertThat(images.deleted).containsExactly(saved.imageUrl());
    }

    @Test
    void sellerCannotChangeAnotherSellerProductButAdminCanAndKeepsOwnerStoragePath() {
        var saved = products.save(product(null, 20, "/uploads/products/20/two.png"));

        assertThatThrownBy(() -> service.updateProduct(10, saved.id(), updateCommand(), null))
                .isInstanceOf(CatalogForbiddenOperationException.class);

        var updated = service.updateProduct(30, saved.id(), updateCommand(), image("admin-replacement.png"));
        assertThat(updated.name()).isEqualTo("Mouse Gamer");
        assertThat(updated.imageUrl()).startsWith("/uploads/products/20/");
    }

    @Test
    void deletesProductAndManagedImage() {
        var saved = products.save(product(null, 10, "/uploads/products/10/delete.png"));

        service.deleteProduct(10, saved.id());

        assertThat(products.findById(saved.id())).isEmpty();
        assertThat(images.deleted).containsExactly(saved.imageUrl());
    }

    private CreateProductCommand createCommand() {
        return new CreateProductCommand("  Teclado   Mecânico ", "RGB", new BigDecimal("299.90"), 5, 1);
    }

    private UpdateProductCommand updateCommand() {
        return new UpdateProductCommand("Mouse Gamer", "Sem fio", new BigDecimal("150.00"), 8, 1);
    }

    private ProductImageContent image(String name) {
        return new ProductImageContent(name, "image/png", new byte[]{1, 2, 3});
    }

    private Product product(Integer id, int sellerId, String imageUrl) {
        return new Product(
                id,
                sellerId,
                new ProductName("Produto Teste"),
                new ProductDescription("Descrição"),
                new ProductPrice(new BigDecimal("10.00")),
                new ProductStock(2),
                1,
                imageUrl,
                LocalDateTime.of(2026, 8, 20, 12, 0)
        );
    }

    private static final class InMemoryActors implements CatalogActorRepositoryPort {
        private final Map<Integer, CatalogActorRole> roles = new LinkedHashMap<>();

        @Override
        public Optional<CatalogActorRole> findRoleByUserId(Integer userId) {
            return Optional.ofNullable(roles.get(userId));
        }
    }

    private static final class InMemoryImages implements ProductImageStoragePort {
        private final List<String> stored = new ArrayList<>();
        private final List<String> deleted = new ArrayList<>();

        @Override
        public String store(Integer sellerId, ProductImageContent image) {
            var url = "/uploads/products/" + sellerId + "/" + (stored.size() + 1) + ".png";
            stored.add(url);
            return url;
        }

        @Override
        public void delete(String imageUrl) {
            if (imageUrl != null && !imageUrl.isBlank()) {
                deleted.add(imageUrl);
            }
        }
    }

    private static final class InMemoryCategories implements ProductCategoryRepositoryPort {
        private final Set<Integer> activeIds = Set.of(1);

        @Override
        public boolean existsActiveById(Integer categoryId) {
            return activeIds.contains(categoryId);
        }
    }

    private final class InMemoryProducts implements ProductRepositoryPort {
        private final Map<Integer, Product> data = new LinkedHashMap<>();
        private int sequence = 1;
        private boolean failOnSave;

        @Override
        public Product save(Product product) {
            if (failOnSave) {
                throw new IllegalStateException("database unavailable");
            }
            var saved = product.id() == null ? product.withId(sequence++) : product;
            data.put(saved.id(), saved);
            return saved;
        }

        @Override
        public Optional<Product> findById(Integer id) {
            return Optional.ofNullable(data.get(id));
        }

        @Override
        public ProductSlice findPage(int page, int limit) {
            return new ProductSlice(List.copyOf(data.values()), data.size());
        }

        @Override
        public List<Product> findBySellerId(Integer sellerId) {
            return data.values().stream().filter(product -> product.sellerId().equals(sellerId)).toList();
        }

        @Override
        public void deleteById(Integer id) {
            data.remove(id);
        }
    }
}
