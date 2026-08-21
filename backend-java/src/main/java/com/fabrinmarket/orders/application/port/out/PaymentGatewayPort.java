package com.fabrinmarket.orders.application.port.out;

import java.math.BigDecimal;
import java.util.List;

/**
 * Boundary for an external payment provider. The provider adapter belongs to the next block;
 * application code only supplies persisted order data and receives neutral results.
 */
public interface PaymentGatewayPort {

    PaymentPreference createPreference(PaymentPreferenceCommand command);

    PaymentDetails getPayment(String providerPaymentId);

    record PaymentPreferenceCommand(
            Integer orderId,
            String orderReference,
            BigDecimal total,
            List<PaymentLine> items
    ) {
        public PaymentPreferenceCommand {
            items = List.copyOf(items);
        }
    }

    record PaymentLine(Integer productId, String title, Integer quantity, BigDecimal unitPrice) {
    }

    record PaymentPreference(String providerPreferenceId, String checkoutUrl) {
    }

    record PaymentDetails(String providerPaymentId, String status, String externalReference) {
    }
}
