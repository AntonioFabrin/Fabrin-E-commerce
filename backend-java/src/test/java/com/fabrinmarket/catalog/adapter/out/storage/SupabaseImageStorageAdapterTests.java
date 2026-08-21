package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import com.fabrinmarket.catalog.domain.exception.ProductImageStorageException;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseImageStorageAdapterTests {

    private static final String SERVICE_KEY = "server-only-service-role-key";
    private static final String STORAGE_URL = "https://project.supabase.co/storage/v1";

    private MockRestServiceServer server;
    private SupabaseImageStorageAdapter storage;

    @BeforeEach
    void setUp() {
        var properties = properties();
        var builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        storage = new SupabaseImageStorageAdapter(properties, new ProductImageValidator(), builder);
    }

    @Test
    void uploadsValidatedBytesToUniqueSellerPathAndReturnsPublicUrl() {
        server.expect(requestTo(Matchers.matchesPattern(
                        STORAGE_URL + "/object/product-images/7/[0-9a-f-]+\\.png"
                )))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("apikey", SERVICE_KEY))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_KEY))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE))
                .andExpect(header("x-upsert", "false"))
                .andExpect(content().bytes(png()))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        var imageUrl = storage.store(7, image(png()));

        assertThat(imageUrl).matches(
                STORAGE_URL + "/object/public/product-images/7/[0-9a-f-]+\\.png"
        );
        server.verify();
    }

    @Test
    void removesOnlyManagedPublicObjectsUsingStorageApi() {
        var imageUrl = STORAGE_URL
                + "/object/public/product-images/7/1ee5c0d8-b10c-4cd1-bad8-c26428c51b75.png";
        server.expect(requestTo(STORAGE_URL + "/object/product-images"))
                .andExpect(method(HttpMethod.DELETE))
                .andExpect(header("apikey", SERVICE_KEY))
                .andExpect(content().json("""
                        {"prefixes":["7/1ee5c0d8-b10c-4cd1-bad8-c26428c51b75.png"]}
                        """))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        storage.delete("https://legacy.example/image.png");
        storage.delete(STORAGE_URL + "/object/public/product-images/../../foreign.png");
        storage.delete(imageUrl);

        server.verify();
    }

    @Test
    void rejectsInvalidContentBeforeCallingSupabase() {
        assertThatThrownBy(() -> storage.store(7, image("not-an-image".getBytes())))
                .isInstanceOf(InvalidProductImageException.class);
        server.verify();
    }

    @Test
    void mapsSupabaseFailureWithoutLeakingCredentials() {
        server.expect(requestTo(Matchers.matchesPattern(
                        STORAGE_URL + "/object/product-images/7/[0-9a-f-]+\\.png"
                )))
                .andRespond(withServerError());

        assertThatThrownBy(() -> storage.store(7, image(png())))
                .isInstanceOf(ProductImageStorageException.class)
                .hasMessage("Não foi possível armazenar a imagem no Supabase.")
                .hasMessageNotContaining(SERVICE_KEY);
        server.verify();
    }

    @Test
    void requiresCompleteAndSafeSupabaseConfiguration() {
        var properties = properties();
        properties.getSupabase().setServiceRoleKey(" ");

        assertThatThrownBy(() -> new SupabaseImageStorageAdapter(
                properties,
                new ProductImageValidator(),
                RestClient.builder()
        )).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("service role key");
    }

    private ProductStorageProperties properties() {
        var properties = new ProductStorageProperties();
        properties.getSupabase().setUrl("https://project.supabase.co/");
        properties.getSupabase().setServiceRoleKey(SERVICE_KEY);
        properties.getSupabase().setBucket("product-images");
        return properties;
    }

    private ProductImageContent image(byte[] bytes) {
        return new ProductImageContent("ignored.exe", "application/octet-stream", bytes);
    }

    private byte[] png() {
        return new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01};
    }
}
