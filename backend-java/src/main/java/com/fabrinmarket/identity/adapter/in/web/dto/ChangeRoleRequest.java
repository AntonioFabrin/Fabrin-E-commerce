package com.fabrinmarket.identity.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangeRoleRequest(
        @NotBlank
        @Pattern(regexp = "customer|seller|admin", message = "role inválida")
        String role
) {
}
