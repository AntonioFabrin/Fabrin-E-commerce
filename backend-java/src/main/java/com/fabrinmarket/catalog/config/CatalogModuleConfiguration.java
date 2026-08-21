package com.fabrinmarket.catalog.config;

import com.fabrinmarket.catalog.adapter.out.storage.ProductStorageProperties;
import com.fabrinmarket.catalog.application.port.out.CatalogActorRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import com.fabrinmarket.catalog.application.port.out.ProductCategoryRepositoryPort;
import com.fabrinmarket.catalog.application.port.out.ProductRepositoryPort;
import com.fabrinmarket.catalog.application.service.CatalogService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
@EnableConfigurationProperties(ProductStorageProperties.class)
public class CatalogModuleConfiguration {

    @Bean
    CatalogService catalogService(
            ProductRepositoryPort products,
            CatalogActorRepositoryPort actors,
            ProductCategoryRepositoryPort categories,
            ProductImageStoragePort images,
            Clock clock
    ) {
        return new CatalogService(products, actors, categories, images, clock);
    }
}
