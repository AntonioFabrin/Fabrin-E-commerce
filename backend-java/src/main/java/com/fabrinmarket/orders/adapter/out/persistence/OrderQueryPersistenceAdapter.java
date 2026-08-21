package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.model.OrderListEntry;
import com.fabrinmarket.orders.application.model.OrderListItem;
import com.fabrinmarket.orders.application.port.out.OrderQueryRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
class OrderQueryPersistenceAdapter implements OrderQueryRepositoryPort {

    private final JdbcTemplate jdbc;

    OrderQueryPersistenceAdapter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<OrderListEntry> findByBuyerId(Integer buyerId) {
        return aggregate(jdbc.query(
                """
                        SELECT o.id, o.total, o.status, COALESCE(o.external_reference, o.reference) AS external_reference,
                               o.created_at, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image_url,
                               payment.payment_method, payment.payment_status, NULL::text AS buyer_name, NULL::text AS buyer_email
                        FROM orders o
                        JOIN order_items oi ON oi.order_id = o.id
                        JOIN products p ON p.id = oi.product_id
                        LEFT JOIN LATERAL (
                            SELECT payment_method, payment_status
                            FROM payments
                            WHERE order_id = o.id
                            ORDER BY id DESC
                            LIMIT 1
                        ) payment ON TRUE
                        WHERE o.user_id = ?
                        ORDER BY o.created_at DESC, o.id DESC, oi.id ASC
                        """,
                this::row,
                buyerId
        ));
    }

    @Override
    public List<OrderListEntry> findBySellerId(Integer sellerId) {
        return aggregate(jdbc.query(
                """
                        SELECT o.id, o.total, o.status, COALESCE(o.external_reference, o.reference) AS external_reference,
                               o.created_at, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image_url,
                               payment.payment_method, payment.payment_status, u.name AS buyer_name, u.email AS buyer_email
                        FROM orders o
                        JOIN order_items oi ON oi.order_id = o.id
                        JOIN products p ON p.id = oi.product_id
                        JOIN users u ON u.id = o.user_id
                        LEFT JOIN LATERAL (
                            SELECT payment_method, payment_status
                            FROM payments
                            WHERE order_id = o.id
                            ORDER BY id DESC
                            LIMIT 1
                        ) payment ON TRUE
                        WHERE p.seller_id = ?
                        ORDER BY o.created_at DESC, o.id DESC, oi.id ASC
                        """,
                this::row,
                sellerId
        ));
    }

    private Row row(ResultSet resultSet, int rowNumber) throws SQLException {
        return new Row(
                resultSet.getInt("id"), resultSet.getBigDecimal("total"), resultSet.getString("status"),
                resultSet.getString("external_reference"), resultSet.getObject("created_at", LocalDateTime.class),
                resultSet.getInt("product_id"), resultSet.getString("product_name"), resultSet.getInt("quantity"),
                resultSet.getBigDecimal("price"), resultSet.getString("image_url"),
                resultSet.getString("payment_method"), resultSet.getString("payment_status"),
                resultSet.getString("buyer_name"), resultSet.getString("buyer_email")
        );
    }

    private List<OrderListEntry> aggregate(List<Row> rows) {
        Map<Integer, Aggregate> grouped = new LinkedHashMap<>();
        for (var row : rows) {
            var aggregate = grouped.computeIfAbsent(row.id, ignored -> new Aggregate(row));
            aggregate.items.add(new OrderListItem(row.productId, row.productName, row.quantity, row.price, row.imageUrl));
        }
        return grouped.values().stream().map(Aggregate::toView).toList();
    }

    private record Row(
            Integer id, BigDecimal total, String status, String externalReference, LocalDateTime createdAt,
            Integer productId, String productName, Integer quantity, BigDecimal price, String imageUrl,
            String paymentMethod, String paymentStatus, String buyerName, String buyerEmail
    ) {
    }

    private static final class Aggregate {
        private final Row row;
        private final List<OrderListItem> items = new ArrayList<>();

        private Aggregate(Row row) {
            this.row = row;
        }

        private OrderListEntry toView() {
            return new OrderListEntry(
                    row.id, row.total, row.status, row.externalReference, row.createdAt, items,
                    row.paymentMethod, row.paymentStatus, row.buyerName, row.buyerEmail
            );
        }
    }
}
