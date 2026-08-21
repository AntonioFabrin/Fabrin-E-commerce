package com.fabrinmarket.catalog.application.model;

public record ProductImageContent(String originalName, String contentType, byte[] bytes) {

    public ProductImageContent {
        bytes = bytes == null ? new byte[0] : bytes.clone();
    }

    @Override
    public byte[] bytes() {
        return bytes.clone();
    }
}
