package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.port.out.OrderActorRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
class OrderActorPersistenceAdapter implements OrderActorRepositoryPort {

    private final JdbcTemplate jdbc;

    OrderActorPersistenceAdapter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public boolean isCurrentSellerOrAdmin(Integer userId) {
        return jdbc.query(
                        "SELECT 1 FROM users WHERE id = ? AND role IN ('seller', 'admin')",
                        (resultSet, rowNumber) -> true,
                        userId
                )
                .stream()
                .findFirst()
                .orElse(false);
    }
}
