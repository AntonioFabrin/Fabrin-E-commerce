package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalProductImageStorageAdapterTests {

    @TempDir
    Path temporaryDirectory;

    private LocalProductImageStorageAdapter storage;

    @BeforeEach
    void setUp() {
        var properties = new ProductStorageProperties();
        properties.setDirectory(temporaryDirectory.toString());
        properties.setPublicPrefix("/uploads/products/");
        storage = new LocalProductImageStorageAdapter(properties, new ProductImageValidator());
    }

    @Test
    void storesAllowedSignaturesUsingGeneratedSafeNames() throws Exception {
        var jpegUrl = storage.store(7, image("../../attack.exe", "application/octet-stream", jpeg()));
        var pngUrl = storage.store(7, image("photo.jpg", "image/jpeg", png()));
        var webpUrl = storage.store(8, image("photo", null, webp()));

        assertThat(jpegUrl).matches("/uploads/products/7/[0-9a-f-]+\\.jpg");
        assertThat(pngUrl).matches("/uploads/products/7/[0-9a-f-]+\\.png");
        assertThat(webpUrl).matches("/uploads/products/8/[0-9a-f-]+\\.webp");
        assertThat(resolve(jpegUrl)).exists().hasBinaryContent(jpeg());
        assertThat(resolve(pngUrl)).exists().hasBinaryContent(png());
        assertThat(resolve(webpUrl)).exists().hasBinaryContent(webp());
    }

    @Test
    void rejectsEmptySpoofedAndOversizedContent() {
        assertThatThrownBy(() -> storage.store(1, image("empty.png", "image/png", new byte[0])))
                .isInstanceOf(InvalidProductImageException.class);
        assertThatThrownBy(() -> storage.store(1, image("fake.png", "image/png", "not-an-image".getBytes())))
                .isInstanceOf(InvalidProductImageException.class);

        var oversized = new byte[ProductImageValidator.MAXIMUM_IMAGE_BYTES + 1];
        oversized[0] = (byte) 0xFF;
        oversized[1] = (byte) 0xD8;
        oversized[2] = (byte) 0xFF;
        assertThatThrownBy(() -> storage.store(1, image("large.jpg", "image/jpeg", oversized)))
                .isInstanceOf(InvalidProductImageException.class)
                .hasMessageContaining("5 MiB");
    }

    @Test
    void deletesOnlyFilesOwnedByConfiguredPublicPrefix() throws Exception {
        var imageUrl = storage.store(11, image("photo.png", "image/png", png()));
        var storedPath = resolve(imageUrl);
        var external = temporaryDirectory.getParent().resolve("must-stay.txt");
        Files.writeString(external, "safe");

        storage.delete("https://legacy.example/image.png");
        storage.delete("/uploads/products/../../must-stay.txt");
        storage.delete(imageUrl);
        storage.delete(imageUrl);

        assertThat(storedPath).doesNotExist();
        assertThat(external).exists();
    }

    @Test
    void rejectsInvalidSellerAndKeepsStoredFilesInsideRoot() {
        assertThatThrownBy(() -> storage.store(0, image("photo.png", "image/png", png())))
                .isInstanceOf(InvalidProductImageException.class);
        assertThat(temporaryDirectory).isEmptyDirectory();
    }

    private ProductImageContent image(String name, String contentType, byte[] bytes) {
        return new ProductImageContent(name, contentType, bytes);
    }

    private Path resolve(String publicUrl) {
        return temporaryDirectory.resolve(publicUrl.substring("/uploads/products/".length()).replace('/', java.io.File.separatorChar));
    }

    private byte[] jpeg() {
        return new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01};
    }

    private byte[] png() {
        return new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01};
    }

    private byte[] webp() {
        return new byte[]{'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P', 1};
    }
}
