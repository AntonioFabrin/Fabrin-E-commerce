package com.fabrinmarket.catalog.adapter.out.persistence;

import com.fabrinmarket.catalog.application.port.out.CatalogActorRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductCategoryRepositoryPort;
import com.fabrinmarket.catalog.domain.model.CatalogActorRole;
import com.fabrinmarket.catalog.domain.model.Product;
import com.fabrinmarket.catalog.domain.model.ProductDescription;
import com.fabrinmarket.catalog.domain.model.ProductName;
import com.fabrinmarket.catalog.domain.model.ProductPrice;
import com.fabrinmarket.catalog.domain.model.ProductStock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.flyway.baseline-version=0"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ProductPersistenceAdapter.class, CatalogActorPersistenceAdapter.class, ProductCategoryPersistenceAdapter.class})
class CatalogPersistenceAdapterTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withInitScript("legacy-catalog.sql");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private ProductRepositoryPort products;

    @Autowired
    private CatalogActorRepositoryPort actors;

    @Autowired
    private ProductCategoryRepositoryPort categories;

    @Test
    void migratesAndReadsLegacyCatalogWithNewestProductFirst() {
        var page = products.findPage(1, 10);

        assertThat(page.totalItems()).isEqualTo(2);
        assertThat(page.items()).extracting(Product::id).containsExactly(101, 100);
        assertThat(page.items().getLast().categoryId()).isEqualTo(1);
        assertThat(page.items().getFirst().imageUrl()).isEqualTo("/uploads/recent.png");
    }

    @Test
    void createsUpdatesAndFindsProductsBySeller() {
        var created = products.save(product(null, "Produto Novo"));
        var updated = products.save(created.withDetails(
                new ProductName("Produto Atualizado"),
                new ProductDescription("Atualizado"),
                new ProductPrice(new BigDecimal("49.90")),
                new ProductStock(9),
                1
        ));

        assertThat(updated.id()).isGreaterThan(101);
        assertThat(products.findBySellerId(10)).extracting(Product::id).contains(updated.id());
        assertThat(products.findById(updated.id()).orElseThrow().name().value()).isEqualTo("Produto Atualizado");
    }

    @Test
    void deletesProduct() {
        var created = products.save(product(null, "Produto Removível"));

        products.deleteById(created.id());

        assertThat(products.findById(created.id())).isEmpty();
    }

    @Test
    void readsCurrentActorRoleFromLegacyUsers() {
        assertThat(actors.findRoleByUserId(10)).contains(CatalogActorRole.SELLER);
        assertThat(actors.findRoleByUserId(20)).contains(CatalogActorRole.CUSTOMER);
        assertThat(actors.findRoleByUserId(999)).isEmpty();
    }

    @Test
    void migratesLegacyCategoriesAndChecksOnlyActiveEntries() {
        assertThat(categories.existsActiveById(1)).isTrue();
        assertThat(categories.existsActiveById(999)).isFalse();
        assertThat(categories.existsActiveById(0)).isFalse();

        jdbcUpdate("UPDATE categories SET active = FALSE WHERE id = 1");

        assertThat(categories.existsActiveById(1)).isFalse();
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private void jdbcUpdate(String sql) {
        jdbcTemplate.update(sql);
    }

    private Product product(Integer id, String name) {
        return new Product(
                id,
                10,
                new ProductName(name),
                new ProductDescription("Descrição"),
                new ProductPrice(new BigDecimal("39.90")),
                new ProductStock(4),
                1,
                "/uploads/products/10/new.png",
                LocalDateTime.of(2026, 8, 20, 12, 0)
        );
    }
}
