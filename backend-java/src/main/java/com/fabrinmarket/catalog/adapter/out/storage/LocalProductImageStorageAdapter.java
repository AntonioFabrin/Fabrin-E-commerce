package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "storage.product", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalProductImageStorageAdapter implements ProductImageStoragePort {

    private final Path rootDirectory;
    private final String publicPrefix;
    private final ProductImageValidator imageValidator;

    public LocalProductImageStorageAdapter(ProductStorageProperties properties, ProductImageValidator imageValidator) {
        rootDirectory = properties.rootDirectory();
        publicPrefix = properties.normalizedPublicPrefix();
        this.imageValidator = imageValidator;
        try {
            Files.createDirectories(rootDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Não foi possível preparar o diretório de imagens de produtos.", exception);
        }
    }

    @Override
    public String store(Integer sellerId, ProductImageContent image) {
        var validatedImage = imageValidator.validate(sellerId, image);
        var bytes = validatedImage.bytes();
        var sellerDirectory = rootDirectory.resolve(sellerId.toString()).normalize();
        ensureInsideRoot(sellerDirectory);
        var fileName = UUID.randomUUID() + validatedImage.extension();
        var destination = sellerDirectory.resolve(fileName).normalize();
        ensureInsideRoot(destination);

        Path temporaryFile = null;
        try {
            Files.createDirectories(sellerDirectory);
            temporaryFile = Files.createTempFile(sellerDirectory, ".upload-", ".tmp");
            Files.write(temporaryFile, bytes);
            moveAtomicallyWhenSupported(temporaryFile, destination);
            return publicPrefix + "/" + sellerId + "/" + fileName;
        } catch (IOException exception) {
            throw new InvalidProductImageException("Não foi possível armazenar a imagem do produto.");
        } finally {
            deleteTemporaryFileQuietly(temporaryFile);
        }
    }

    @Override
    public void delete(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(publicPrefix + "/")) {
            return;
        }

        var relativeValue = imageUrl.substring(publicPrefix.length() + 1);
        if (relativeValue.isBlank() || relativeValue.contains("?") || relativeValue.contains("#")) {
            return;
        }

        try {
            var target = rootDirectory.resolve(relativeValue.replace('/', java.io.File.separatorChar)).normalize();
            ensureInsideRoot(target);
            if (!target.equals(rootDirectory)) {
                Files.deleteIfExists(target);
            }
        } catch (IOException | InvalidPathException | InvalidProductImageException ignored) {
            // A remoção é idempotente e nunca alcança caminhos externos ao diretório configurado.
        }
    }

    private void ensureInsideRoot(Path path) {
        if (!path.startsWith(rootDirectory) || path.equals(rootDirectory)) {
            throw new InvalidProductImageException("O caminho da imagem é inválido.");
        }
    }

    private void moveAtomicallyWhenSupported(Path source, Path destination) throws IOException {
        try {
            Files.move(source, destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException exception) {
            Files.move(source, destination);
        }
    }

    private void deleteTemporaryFileQuietly(Path temporaryFile) {
        if (temporaryFile == null) {
            return;
        }
        try {
            Files.deleteIfExists(temporaryFile);
        } catch (IOException ignored) {
            // A tentativa de limpeza não deve esconder o resultado principal do upload.
        }
    }
}
