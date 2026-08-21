package com.fabrinmarket.catalog.adapter.out.storage;

public record ValidatedProductImage(byte[] bytes, String extension, String contentType) {

    public ValidatedProductImage {
        bytes = bytes.clone();
    }

    @Override
    public byte[] bytes() {
        return bytes.clone();
    }
}
