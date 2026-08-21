package com.fabrinmarket.orders.application.port.out;

import com.fabrinmarket.orders.domain.model.StockReservation;

import java.util.List;

public interface StockReservationRepositoryPort {

    List<StockReservation> saveAll(List<StockReservation> reservations);

    List<StockReservation> findByOrderId(Integer orderId);
}
