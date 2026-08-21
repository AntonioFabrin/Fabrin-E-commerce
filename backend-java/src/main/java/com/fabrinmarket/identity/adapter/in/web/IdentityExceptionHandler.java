package com.fabrinmarket.identity.adapter.in.web;

import com.fabrinmarket.identity.domain.exception.EmailAlreadyInUseException;
import com.fabrinmarket.identity.domain.exception.ForbiddenOperationException;
import com.fabrinmarket.identity.domain.exception.IdentityException;
import com.fabrinmarket.identity.domain.exception.InvalidCredentialsException;
import com.fabrinmarket.identity.domain.exception.InvalidTokenException;
import com.fabrinmarket.identity.domain.exception.InvalidUserDataException;
import com.fabrinmarket.identity.domain.exception.UserNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice(assignableTypes = {AuthController.class, UserController.class})
public class IdentityExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdentityExceptionHandler.class);

    @ExceptionHandler(IdentityException.class)
    ResponseEntity<Map<String, Object>> handleIdentityException(IdentityException exception) {
        HttpStatus status;
        if (exception instanceof EmailAlreadyInUseException) {
            status = HttpStatus.CONFLICT;
        } else if (exception instanceof InvalidCredentialsException || exception instanceof InvalidTokenException) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (exception instanceof ForbiddenOperationException) {
            status = HttpStatus.FORBIDDEN;
        } else if (exception instanceof UserNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (exception instanceof InvalidUserDataException) {
            status = HttpStatus.BAD_REQUEST;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status).body(error(exception.getMessage(), exception.code()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, List<String>> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        FieldError::getField,
                        LinkedHashMap::new,
                        java.util.stream.Collectors.mapping(FieldError::getDefaultMessage, java.util.stream.Collectors.toList())
                ))
                .forEach(fields::put);

        var body = error("Dados inválidos.", "VALIDATION_ERROR");
        body.put("erros", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, Object>> handleUnreadableBody(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(error("Corpo da requisição inválido.", "INVALID_REQUEST_BODY"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        LOGGER.error("Unexpected identity request failure", exception);
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
