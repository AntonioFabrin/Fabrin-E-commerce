package com.fabrinmarket.catalog.adapter.out.storage;

import com.fabrinmarket.catalog.application.model.ProductImageContent;
import com.fabrinmarket.catalog.application.port.out.ProductImageStoragePort;
import com.fabrinmarket.catalog.domain.exception.ProductImageStorageException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
@ConditionalOnProperty(prefix = "storage.product", name = "provider", havingValue = "supabase")
public class SupabaseImageStorageAdapter implements ProductImageStoragePort {

    private static final Pattern MANAGED_OBJECT_PATTERN = Pattern.compile(
            "[1-9][0-9]*/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)"
    );

    private final ProductImageValidator imageValidator;
    private final RestClient restClient;
    private final String bucket;
    private final String publicUrlPrefix;

    public SupabaseImageStorageAdapter(
            ProductStorageProperties properties,
            ProductImageValidator imageValidator,
            RestClient.Builder restClientBuilder
    ) {
        this.imageValidator = imageValidator;
        var storageUrl = properties.normalizedSupabaseStorageUrl();
        var serviceRoleKey = properties.requiredSupabaseServiceRoleKey();
        bucket = properties.requiredSupabaseBucket();
        publicUrlPrefix = storageUrl + "/object/public/" + bucket + "/";
        restClient = restClientBuilder.clone()
                .baseUrl(storageUrl)
                .defaultHeader("apikey", serviceRoleKey)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .build();
    }

    @Override
    public String store(Integer sellerId, ProductImageContent image) {
        var validatedImage = imageValidator.validate(sellerId, image);
        var fileName = UUID.randomUUID() + validatedImage.extension();
        var objectPath = sellerId + "/" + fileName;
        try {
            restClient.post()
                    .uri(uriBuilder -> uriBuilder.pathSegment("object", bucket, sellerId.toString(), fileName).build())
                    .contentType(MediaType.parseMediaType(validatedImage.contentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .header("x-upsert", "false")
                    .body(validatedImage.bytes())
                    .retrieve()
                    .toBodilessEntity();
            return publicUrlPrefix + objectPath;
        } catch (RestClientException exception) {
            throw new ProductImageStorageException("Não foi possível armazenar a imagem no Supabase.");
        }
    }

    @Override
    public void delete(String imageUrl) {
        var objectPath = managedObjectPath(imageUrl);
        if (objectPath == null) {
            return;
        }
        try {
            restClient.method(HttpMethod.DELETE)
                    .uri(uriBuilder -> uriBuilder.pathSegment("object", bucket).build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("prefixes", List.of(objectPath)))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw new ProductImageStorageException("Não foi possível remover a imagem do Supabase.");
        }
    }

    private String managedObjectPath(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(publicUrlPrefix)) {
            return null;
        }
        var objectPath = imageUrl.substring(publicUrlPrefix.length());
        return MANAGED_OBJECT_PATTERN.matcher(objectPath).matches() ? objectPath : null;
    }
}
