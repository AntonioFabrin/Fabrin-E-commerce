package com.fabrinmarket.catalog.adapter.out.persistence;

import com.fabrinmarket.catalog.application.port.out.ProductCategoryRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
class ProductCategoryPersistenceAdapter implements ProductCategoryRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    ProductCategoryPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean existsActiveById(Integer categoryId) {
        if (categoryId == null || categoryId <= 0) {
            return false;
        }
        var count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categories WHERE id = ? AND active = TRUE",
                Integer.class,
                categoryId
        );
        return count != null && count > 0;
    }
}
