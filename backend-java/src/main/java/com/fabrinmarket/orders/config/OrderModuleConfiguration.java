package com.fabrinmarket.orders.config;

import com.fabrinmarket.orders.application.port.out.OrderProductRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderActorRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderQueryRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderRepositoryPort;
import com.fabrinmarket.orders.application.port.out.OrderTransactionPort;
import com.fabrinmarket.orders.application.port.out.StockReservationRepositoryPort;
import com.fabrinmarket.orders.application.service.OrderService;
import com.fabrinmarket.orders.application.service.OrderQueryService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class OrderModuleConfiguration {

    @Bean
    OrderService orderService(
            OrderRepositoryPort orders,
            StockReservationRepositoryPort reservations,
            OrderProductRepositoryPort products,
            OrderTransactionPort transactions,
            Clock clock
    ) {
        return new OrderService(orders, reservations, products, transactions, clock);
    }

    @Bean
    OrderQueryService orderQueryService(OrderQueryRepositoryPort queries, OrderActorRepositoryPort actors) {
        return new OrderQueryService(queries, actors);
    }
}
