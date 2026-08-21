package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "storage.product.provider=supabase",
        "storage.product.supabase.url=https://project.supabase.co",
        "storage.product.supabase.service-role-key=test-only-service-role-key",
        "storage.product.supabase.bucket=product-images"
})
@ActiveProfiles("test")
class SupabaseStorageConfigurationTests {

    @Autowired
    private ProductImageStoragePort storage;

    @Test
    void selectsOnlyTheSupabaseAdapterWhenConfigured() {
        assertThat(storage).isInstanceOf(SupabaseImageStorageAdapter.class);
    }
}
