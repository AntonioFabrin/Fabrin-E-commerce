package com.fabrinmarket.catalog.application.port.out;

public interface ProductCategoryRepositoryPort {

    boolean existsActiveById(Integer categoryId);
}
