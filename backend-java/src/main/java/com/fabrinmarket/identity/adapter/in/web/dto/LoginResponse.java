package com.fabrinmarket.identity.adapter.in.web.dto;

public record LoginResponse(String mensagem, String token, UserResponse user) {
}
