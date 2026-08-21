package com.fabrinmarket.catalog.adapter.out.persistence;

import com.fabrinmarket.catalog.application.port.out.CatalogActorRepositoryPort;
import com.fabrinmarket.catalog.domain.model.CatalogActorRole;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
class CatalogActorPersistenceAdapter implements CatalogActorRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    CatalogActorPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<CatalogActorRole> findRoleByUserId(Integer userId) {
        return jdbcTemplate.query(
                        "SELECT role FROM users WHERE id = ?",
                        (resultSet, rowNumber) -> CatalogActorRole.from(resultSet.getString("role")),
                        userId
                )
                .stream()
                .findFirst();
    }
}
