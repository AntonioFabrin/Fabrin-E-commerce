package com.fabrinmarket.orders.adapter.in.web;

import com.fabrinmarket.orders.domain.exception.IdempotencyConflictException;
import com.fabrinmarket.orders.domain.exception.InsufficientStockException;
import com.fabrinmarket.orders.domain.exception.InvalidOrderDataException;
import com.fabrinmarket.orders.domain.exception.OrderException;
import com.fabrinmarket.orders.domain.exception.OrderForbiddenOperationException;
import com.fabrinmarket.orders.domain.exception.OrderProductNotFoundException;
import com.fabrinmarket.orders.domain.exception.OrderNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(assignableTypes = OrderController.class)
public class OrderExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderExceptionHandler.class);

    @ExceptionHandler(OrderException.class)
    ResponseEntity<Map<String, Object>> handleOrderException(OrderException exception) {
        if (exception instanceof OrderProductNotFoundException || exception instanceof OrderNotFoundException) {
            return response(HttpStatus.NOT_FOUND, exception.getMessage(), "ORDER_PRODUCT_NOT_FOUND");
        }
        if (exception instanceof InsufficientStockException) {
            return response(HttpStatus.CONFLICT, exception.getMessage(), "INSUFFICIENT_STOCK");
        }
        if (exception instanceof IdempotencyConflictException) {
            return response(HttpStatus.CONFLICT, exception.getMessage(), "IDEMPOTENCY_CONFLICT");
        }
        if (exception instanceof OrderForbiddenOperationException) {
            return response(HttpStatus.FORBIDDEN, exception.getMessage(), "ORDER_ACCESS_DENIED");
        }
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), "INVALID_ORDER_DATA");
    }

    @ExceptionHandler({MissingRequestHeaderException.class, HttpMessageNotReadableException.class})
    ResponseEntity<Map<String, Object>> handleMalformedRequest(Exception exception) {
        return response(HttpStatus.BAD_REQUEST, "Dados do pedido inválidos.", "INVALID_ORDER_DATA");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        LOGGER.error("Unexpected order request failure", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor.", "INTERNAL_ERROR");
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("erro", message);
        body.put("codigo", code);
        return ResponseEntity.status(status).body(body);
    }
}
