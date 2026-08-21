package com.fabrinmarket.orders.application.port.out;

import java.util.function.Supplier;

public interface OrderTransactionPort {

    <T> T execute(Supplier<T> action);
}
