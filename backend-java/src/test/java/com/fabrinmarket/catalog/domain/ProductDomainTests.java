package com.fabrinmarket.catalog.domain;

import com.fabrinmarket.catalog.domain.exception.InvalidProductDataException;
import com.fabrinmarket.catalog.domain.model.ProductDescription;
import com.fabrinmarket.catalog.domain.model.ProductName;
import com.fabrinmarket.catalog.domain.model.ProductPrice;
import com.fabrinmarket.catalog.domain.model.ProductStock;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductDomainTests {

    @Test
    void normalizesValidValues() {
        assertThat(new ProductName("  Teclado   Mecânico ").value()).isEqualTo("Teclado Mecânico");
        assertThat(new ProductDescription("  Descrição  ").value()).isEqualTo("Descrição");
        assertThat(new ProductPrice(new BigDecimal("10.5")).value()).isEqualByComparingTo("10.50");
        assertThat(new ProductStock(0).value()).isZero();
    }

    @Test
    void rejectsInvalidPriceAndStock() {
        assertThatThrownBy(() -> new ProductPrice(BigDecimal.ZERO))
                .isInstanceOf(InvalidProductDataException.class);
        assertThatThrownBy(() -> new ProductPrice(new BigDecimal("1.001")))
                .isInstanceOf(InvalidProductDataException.class);
        assertThatThrownBy(() -> new ProductStock(-1))
                .isInstanceOf(InvalidProductDataException.class);
    }
}
