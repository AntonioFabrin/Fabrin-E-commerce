package com.fabrinmarket.identity.adapter.in.web.dto;

import java.util.List;

public record UsersResponse(int total, List<UserResponse> usuarios) {
}
