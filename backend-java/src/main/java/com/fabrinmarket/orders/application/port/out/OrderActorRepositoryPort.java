package com.fabrinmarket.orders.application.port.out;

public interface OrderActorRepositoryPort {
    boolean isCurrentSellerOrAdmin(Integer userId);
}
