package com.fabrinmarket.orders.adapter.out.persistence;

import com.fabrinmarket.orders.application.port.out.OrderTransactionPort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Supplier;

@Component
class SpringOrderTransactionAdapter implements OrderTransactionPort {

    @Override
    @Transactional
    public <T> T execute(Supplier<T> action) {
        return action.get();
    }
}
