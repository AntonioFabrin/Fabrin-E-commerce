package com.fabrinmarket.catalog.config;

import com.fabrinmarket.catalog.adapter.out.storage.ProductStorageProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(ProductStorageProperties.class)
public class CatalogWebConfiguration implements WebMvcConfigurer {

    private final ProductStorageProperties properties;

    public CatalogWebConfiguration(ProductStorageProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(properties.normalizedPublicPrefix() + "/**")
                .addResourceLocations(properties.rootDirectory().toUri().toString());
    }
}
