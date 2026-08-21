package com.fabrinmarket.catalog;

import com.fasterxml.jackson.databind.JsonNode;
import com.fabrinmarket.identity.application.port.out.PasswordHasherPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CatalogEndToEndIntegrationTests {

    private static final String JWT_SECRET = "catalog-integration-test-secret-with-at-least-32-bytes";

    @TempDir
    static Path uploadDirectory;

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureApplication(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("security.jwt.secret", () -> JWT_SECRET);
        registry.add("security.jwt.issuer", () -> "fabrinmarket-catalog-integration-test");
        registry.add("security.jwt.expiration", () -> "PT8H");
        registry.add("storage.product.directory", () -> uploadDirectory.toString());
    }

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordHasherPort passwords;

    @Test
    void executesTheCompleteCatalogAuthorizationAndImageFlow() throws Exception {
        var publicEmptyList = json(HttpMethod.GET, "/api/products", null, null);
        assertStatus(publicEmptyList, HttpStatus.OK);
        assertThat(publicEmptyList.getBody().path("dados")).isEmpty();
        assertStatus(json(HttpMethod.GET, "/api/products/seller", null, null), HttpStatus.UNAUTHORIZED);
        assertStatus(json(HttpMethod.GET, "/api/products?page=0", null, null), HttpStatus.BAD_REQUEST);

        var customerId = register("Catalog Customer", "catalog.customer@example.com", "senha123", "customer");
        var sellerId = register("Catalog Seller", "catalog.seller@example.com", "senha123", "seller");
        register("Other Seller", "catalog.other@example.com", "senha123", "seller");

        var customerToken = login("catalog.customer@example.com", "senha123");
        var sellerToken = login("catalog.seller@example.com", "senha123");
        var otherSellerToken = login("catalog.other@example.com", "senha123");

        assertStatus(createProduct(customerToken, png(), "image/png", "customer.png"), HttpStatus.FORBIDDEN);

        var spoofed = createProduct(sellerToken, "not-an-image".getBytes(), "image/png", "fake.png");
        assertStatus(spoofed, HttpStatus.BAD_REQUEST);
        assertThat(spoofed.getBody().path("codigo").asText()).isEqualTo("INVALID_PRODUCT_IMAGE");
        assertThat(productCount()).isZero();

        var invalidCategory = createProduct(sellerToken, png(), "image/png", "invalid-category.png", 999);
        assertStatus(invalidCategory, HttpStatus.BAD_REQUEST);
        assertThat(invalidCategory.getBody().path("codigo").asText()).isEqualTo("INVALID_PRODUCT_DATA");
        assertThat(productCount()).isZero();
        assertThat(uploadDirectory).isEmptyDirectory();

        var created = createProduct(sellerToken, png(), "image/png", "../../unsafe.exe");
        assertStatus(created, HttpStatus.CREATED);
        var productId = created.getBody().path("produtoId").asInt();
        assertThat(productId).isPositive();

        var detail = json(HttpMethod.GET, "/api/products/" + productId, null, null);
        assertStatus(detail, HttpStatus.OK);
        assertThat(detail.getBody().path("seller_id").asInt()).isEqualTo(sellerId);
        assertThat(detail.getBody().path("name").asText()).isEqualTo("Produto integrado");
        var firstImageUrl = detail.getBody().path("image_url").asText();
        assertThat(firstImageUrl).matches("/uploads/products/" + sellerId + "/[0-9a-f-]+\\.png");
        var firstImagePath = storedPath(firstImageUrl);
        assertThat(firstImagePath).exists().hasBinaryContent(png());

        var publicList = json(HttpMethod.GET, "/api/products?page=1&limit=10", null, null);
        assertStatus(publicList, HttpStatus.OK);
        assertThat(publicList.getBody().path("paginacao").path("total_de_itens").asInt()).isEqualTo(1);
        assertThat(publicList.getBody().path("dados").get(0).path("id").asInt()).isEqualTo(productId);

        var servedImage = http.exchange(firstImageUrl, HttpMethod.GET, HttpEntity.EMPTY, byte[].class);
        assertThat(servedImage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(servedImage.getBody()).isEqualTo(png());

        var ownProducts = json(HttpMethod.GET, "/api/products/seller", null, sellerToken);
        assertStatus(ownProducts, HttpStatus.OK);
        assertThat(ownProducts.getBody()).hasSize(1);

        assertStatus(updateProduct(productId, otherSellerToken, null), HttpStatus.FORBIDDEN);
        assertStatus(json(HttpMethod.DELETE, "/api/products/" + productId, null, otherSellerToken), HttpStatus.FORBIDDEN);

        var updated = updateProduct(productId, sellerToken, jpeg());
        assertStatus(updated, HttpStatus.OK);
        assertThat(firstImagePath).doesNotExist();
        assertThat(http.getForEntity(firstImageUrl, String.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        var updatedDetail = json(HttpMethod.GET, "/api/products/" + productId, null, null);
        var replacementImageUrl = updatedDetail.getBody().path("image_url").asText();
        assertThat(replacementImageUrl).endsWith(".jpg");
        assertThat(storedPath(replacementImageUrl)).exists().hasBinaryContent(jpeg());
        assertThat(updatedDetail.getBody().path("name").asText()).isEqualTo("Produto atualizado");

        jdbc.update("UPDATE users SET role = 'customer' WHERE id = ?", sellerId);
        var staleSellerToken = updateProduct(productId, sellerToken, null);
        assertStatus(staleSellerToken, HttpStatus.FORBIDDEN);
        assertThat(staleSellerToken.getBody().path("codigo").asText()).isEqualTo("CATALOG_ACCESS_DENIED");
        jdbc.update("UPDATE users SET role = 'seller' WHERE id = ?", sellerId);

        var adminId = seedAdmin();
        var adminToken = login("catalog.admin@example.com", "senha-admin");
        var adminUpdated = updateProduct(productId, adminToken, null);
        assertStatus(adminUpdated, HttpStatus.OK);
        assertThat(adminId).isNotEqualTo(customerId);

        var deleted = json(HttpMethod.DELETE, "/api/products/" + productId, null, adminToken);
        assertStatus(deleted, HttpStatus.OK);
        assertThat(storedPath(replacementImageUrl)).doesNotExist();
        assertThat(http.getForEntity(replacementImageUrl, String.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(productCount()).isZero();
        assertStatus(json(HttpMethod.GET, "/api/products/" + productId, null, null), HttpStatus.NOT_FOUND);
    }

    private int register(String name, String email, String password, String role) {
        var response = json(HttpMethod.POST, "/api/register", Map.of(
                "name", name,
                "email", email,
                "password", password,
                "role", role
        ), null);
        assertStatus(response, HttpStatus.CREATED);
        return response.getBody().path("id").asInt();
    }

    private String login(String email, String password) {
        var response = json(HttpMethod.POST, "/api/login", Map.of("email", email, "password", password), null);
        assertStatus(response, HttpStatus.OK);
        return response.getBody().path("token").asText();
    }

    private int seedAdmin() {
        return jdbc.queryForObject(
                """
                        INSERT INTO users (name, email, password, role)
                        VALUES (?, ?, ?, 'admin')
                        RETURNING id
                        """,
                Integer.class,
                "Catalog Admin",
                "catalog.admin@example.com",
                passwords.hash("senha-admin")
        );
    }

    private ResponseEntity<JsonNode> createProduct(String token, byte[] image, String contentType, String fileName) {
        return createProduct(token, image, contentType, fileName, 1);
    }

    private ResponseEntity<JsonNode> createProduct(
            String token,
            byte[] image,
            String contentType,
            String fileName,
            int categoryId
    ) {
        var fields = new LinkedMultiValueMap<String, Object>();
        fields.add("name", "Produto integrado");
        fields.add("description", "Criado no teste ponta a ponta");
        fields.add("price", "49.90");
        fields.add("stock", "5");
        fields.add("category_id", Integer.toString(categoryId));
        fields.add("image", filePart(image, contentType, fileName));
        return multipart(HttpMethod.POST, "/api/products", fields, token);
    }

    private ResponseEntity<JsonNode> updateProduct(int productId, String token, byte[] replacementImage) {
        var fields = new LinkedMultiValueMap<String, Object>();
        fields.add("name", "Produto atualizado");
        fields.add("description", "Atualizado no teste ponta a ponta");
        fields.add("price", "59.90");
        fields.add("stock", "8");
        fields.add("category_id", "1");
        if (replacementImage != null) {
            fields.add("image", filePart(replacementImage, "image/jpeg", "replacement.png"));
        }
        return multipart(HttpMethod.PUT, "/api/products/" + productId, fields, token);
    }

    private HttpEntity<ByteArrayResource> filePart(byte[] bytes, String contentType, String fileName) {
        var fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.parseMediaType(contentType));
        var resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
        return new HttpEntity<>(resource, fileHeaders);
    }

    private ResponseEntity<JsonNode> multipart(
            HttpMethod method,
            String path,
            MultiValueMap<String, Object> fields,
            String token
    ) {
        var headers = bearerHeaders(token);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return http.exchange(path, method, new HttpEntity<>(fields, headers), JsonNode.class);
    }

    private ResponseEntity<JsonNode> json(HttpMethod method, String path, Object body, String token) {
        var headers = bearerHeaders(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return http.exchange(path, method, new HttpEntity<>(body, headers), JsonNode.class);
    }

    private HttpHeaders bearerHeaders(String token) {
        var headers = new HttpHeaders();
        if (token != null) {
            headers.setBearerAuth(token);
        }
        return headers;
    }

    private Path storedPath(String publicUrl) {
        return uploadDirectory.resolve(publicUrl.substring("/uploads/products/".length()).replace('/', java.io.File.separatorChar));
    }

    private int productCount() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM products", Integer.class);
    }

    private byte[] png() {
        return new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1};
    }

    private byte[] jpeg() {
        return new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1};
    }

    private void assertStatus(ResponseEntity<JsonNode> response, HttpStatus expected) {
        assertThat(response.getStatusCode())
                .withFailMessage("Expected %s but received %s with body %s", expected, response.getStatusCode(), response.getBody())
                .isEqualTo(expected);
    }
}
