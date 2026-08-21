package com.fabrinmarket.catalog.application.port.out;

import com.fabrinmarket.catalog.domain.model.CatalogActorRole;

import java.util.Optional;

public interface CatalogActorRepositoryPort {
    Optional<CatalogActorRole> findRoleByUserId(Integer userId);
}
