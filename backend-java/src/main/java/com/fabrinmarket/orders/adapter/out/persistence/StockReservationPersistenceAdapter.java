package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.port.out.StockReservationRepositoryPort;
import com.fabrinmarket.orders.domain.model.StockReservation;
import com.fabrinmarket.orders.domain.model.StockReservationStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
class StockReservationPersistenceAdapter implements StockReservationRepositoryPort {

    private final SpringDataStockReservationRepository reservations;

    StockReservationPersistenceAdapter(SpringDataStockReservationRepository reservations) {
        this.reservations = reservations;
    }

    @Override
    public List<StockReservation> saveAll(List<StockReservation> values) {
        return values.stream().map(this::save).toList();
    }

    @Override
    public List<StockReservation> findByOrderId(Integer orderId) {
        return reservations.findByOrderIdOrderByIdAsc(orderId).stream().map(this::toDomain).toList();
    }

    private StockReservation save(StockReservation reservation) {
        StockReservationJpaEntity entity;
        if (reservation.id() == null) {
            entity = new StockReservationJpaEntity(
                    reservation.orderId(), reservation.productId(), reservation.quantity(), reservation.status().value(),
                    reservation.createdAt(), reservation.releasedAt()
            );
        } else {
            entity = reservations.findById(reservation.id()).orElseThrow();
            entity.apply(reservation.status().value(), reservation.releasedAt());
        }
        return toDomain(reservations.saveAndFlush(entity));
    }

    private StockReservation toDomain(StockReservationJpaEntity entity) {
        return new StockReservation(
                entity.getId(), entity.getOrderId(), entity.getProductId(), entity.getQuantity(),
                StockReservationStatus.from(entity.getStatus()), entity.getCreatedAt(), entity.getReleasedAt()
        );
    }
}
