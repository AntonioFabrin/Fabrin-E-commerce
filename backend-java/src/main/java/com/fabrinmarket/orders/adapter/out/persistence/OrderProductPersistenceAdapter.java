package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.port.out.OrderProductRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
class OrderProductPersistenceAdapter implements OrderProductRepositoryPort {

    private final JdbcTemplate jdbc;

    OrderProductPersistenceAdapter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<OrderProductSnapshot> findByIdForUpdate(Integer productId) {
        return jdbc.query(
                        """
                                SELECT id, seller_id, name, price, stock, image_url
                                FROM products
                                WHERE id = ?
                                FOR UPDATE
                                """,
                        (resultSet, rowNumber) -> new OrderProductSnapshot(
                                resultSet.getInt("id"), resultSet.getInt("seller_id"), resultSet.getString("name"),
                                resultSet.getBigDecimal("price"), resultSet.getInt("stock"), resultSet.getString("image_url")
                        ),
                        productId
                )
                .stream()
                .findFirst();
    }

    @Override
    public boolean decreaseStock(Integer productId, int quantity) {
        return jdbc.update("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", quantity, productId, quantity) == 1;
    }

    @Override
    public void increaseStock(Integer productId, int quantity) {
        if (jdbc.update("UPDATE products SET stock = stock + ? WHERE id = ?", quantity, productId) != 1) {
            throw new IllegalStateException("Produto reservado não encontrado ao restaurar estoque.");
        }
    }
}
