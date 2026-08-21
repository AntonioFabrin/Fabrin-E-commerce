package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import org.springframework.stereotype.Component;

@Component
public class ProductImageValidator {

    static final int MAXIMUM_IMAGE_BYTES = 5 * 1024 * 1024;

    public ValidatedProductImage validate(Integer sellerId, ProductImageContent image) {
        if (sellerId == null || sellerId <= 0) {
            throw new InvalidProductImageException("O vendedor da imagem é inválido.");
        }
        if (image == null) {
            throw new InvalidProductImageException("A imagem do produto é obrigatória.");
        }

        var bytes = image.bytes();
        if (bytes.length == 0) {
            throw new InvalidProductImageException("A imagem do produto está vazia.");
        }
        if (bytes.length > MAXIMUM_IMAGE_BYTES) {
            throw new InvalidProductImageException("A imagem deve ter no máximo 5 MiB.");
        }

        if (isJpeg(bytes)) {
            return new ValidatedProductImage(bytes, ".jpg", "image/jpeg");
        }
        if (isPng(bytes)) {
            return new ValidatedProductImage(bytes, ".png", "image/png");
        }
        if (isWebp(bytes)) {
            return new ValidatedProductImage(bytes, ".webp", "image/webp");
        }
        throw new InvalidProductImageException("A imagem deve ser um arquivo JPEG, PNG ou WebP válido.");
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && unsigned(bytes[0]) == 0xFF
                && unsigned(bytes[1]) == 0xD8
                && unsigned(bytes[2]) == 0xFF;
    }

    private boolean isPng(byte[] bytes) {
        int[] signature = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        if (bytes.length < signature.length) {
            return false;
        }
        for (int index = 0; index < signature.length; index++) {
            if (unsigned(bytes[index]) != signature[index]) {
                return false;
            }
        }
        return true;
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && asciiEquals(bytes, 0, "RIFF")
                && asciiEquals(bytes, 8, "WEBP");
    }

    private boolean asciiEquals(byte[] bytes, int offset, String expected) {
        for (int index = 0; index < expected.length(); index++) {
            if (bytes[offset + index] != (byte) expected.charAt(index)) {
                return false;
            }
        }
        return true;
    }

    private int unsigned(byte value) {
        return Byte.toUnsignedInt(value);
    }
}
