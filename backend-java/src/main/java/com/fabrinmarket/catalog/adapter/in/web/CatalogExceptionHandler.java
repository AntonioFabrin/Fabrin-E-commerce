package com.fabrinmarket.catalog.adapter.in.web;

import com.fabrinmarket.catalog.domain.exception.CatalogActorNotFoundException;
import com.fabrinmarket.catalog.domain.exception.CatalogException;
import com.fabrinmarket.catalog.domain.exception.CatalogForbiddenOperationException;
import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;
import com.fabrinmarket.catalog.domain.exception.InvalidProductImageException;
import com.fabrinmarket.catalog.domain.exception.ProductNotFoundException;
import com.fabrinmarket.catalog.domain.exception.ProductImageStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(assignableTypes = ProductController.class)
public class CatalogExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(CatalogExceptionHandler.class);

    @ExceptionHandler(CatalogException.class)
    ResponseEntity<Map<String, Object>> handleCatalogException(CatalogException exception) {
        HttpStatus status;
        if (exception instanceof ProductNotFoundException || exception instanceof CatalogActorNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (exception instanceof CatalogForbiddenOperationException) {
            status = HttpStatus.FORBIDDEN;
        } else if (exception instanceof InvalidProductDataException || exception instanceof InvalidProductImageException) {
            status = HttpStatus.BAD_REQUEST;
        } else if (exception instanceof ProductImageStorageException) {
            status = HttpStatus.BAD_GATEWAY;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status).body(error(exception.getMessage(), exception.code()));
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    ResponseEntity<Map<String, Object>> handleInvalidParameters(Exception exception) {
        return ResponseEntity.badRequest().body(error("Dados do produto inválidos.", "INVALID_PRODUCT_DATA"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Map<String, Object>> handleOversizedUpload(MaxUploadSizeExceededException exception) {
        return ResponseEntity.badRequest().body(error("A imagem deve ter no máximo 5 MiB.", "INVALID_PRODUCT_IMAGE"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        LOGGER.error("Unexpected catalog request failure", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error("Erro interno do servidor.", "INTERNAL_ERROR"));
    }

    private Map<String, Object> error(String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("erro", message);
        body.put("codigo", code);
        return body;
    }
}
