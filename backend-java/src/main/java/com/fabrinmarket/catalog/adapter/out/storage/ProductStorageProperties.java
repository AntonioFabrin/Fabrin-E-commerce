package com.fabrinmarket.catalog.adapter.out.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.regex.Pattern;

@ConfigurationProperties(prefix = "storage.product")
public class ProductStorageProperties {

    private static final Pattern BUCKET_PATTERN = Pattern.compile("[A-Za-z0-9._-]+");

    private String provider = "local";
    private String directory = "./uploads/products";
    private String publicPrefix = "/uploads/products";
    private Supabase supabase = new Supabase();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getDirectory() {
        return directory;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }

    public String getPublicPrefix() {
        return publicPrefix;
    }

    public void setPublicPrefix(String publicPrefix) {
        this.publicPrefix = publicPrefix;
    }

    public Supabase getSupabase() {
        return supabase;
    }

    public void setSupabase(Supabase supabase) {
        this.supabase = supabase;
    }

    public Path rootDirectory() {
        if (directory == null || directory.isBlank()) {
            throw new IllegalStateException("O diretório de imagens de produtos deve ser configurado.");
        }
        return Path.of(directory).toAbsolutePath().normalize();
    }

    public String normalizedPublicPrefix() {
        if (publicPrefix == null || publicPrefix.isBlank() || !publicPrefix.startsWith("/")) {
            throw new IllegalStateException("O prefixo público das imagens deve iniciar com '/'.");
        }
        return publicPrefix.length() > 1 && publicPrefix.endsWith("/")
                ? publicPrefix.substring(0, publicPrefix.length() - 1)
                : publicPrefix;
    }

    public String normalizedSupabaseStorageUrl() {
        var configuredUrl = requiredSupabaseValue(supabase.url, "A URL do Supabase deve ser configurada.");
        try {
            var uri = new URI(configuredUrl);
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null
                    || uri.getQuery() != null
                    || uri.getFragment() != null) {
                throw new IllegalStateException("A URL do Supabase é inválida.");
            }
        } catch (URISyntaxException exception) {
            throw new IllegalStateException("A URL do Supabase é inválida.", exception);
        }
        var normalized = configuredUrl.endsWith("/")
                ? configuredUrl.substring(0, configuredUrl.length() - 1)
                : configuredUrl;
        return normalized.endsWith("/storage/v1") ? normalized : normalized + "/storage/v1";
    }

    public String requiredSupabaseServiceRoleKey() {
        return requiredSupabaseValue(supabase.serviceRoleKey, "A service role key do Supabase deve ser configurada.");
    }

    public String requiredSupabaseBucket() {
        var bucket = requiredSupabaseValue(supabase.bucket, "O bucket de produtos do Supabase deve ser configurado.");
        if (!BUCKET_PATTERN.matcher(bucket).matches()) {
            throw new IllegalStateException("O nome do bucket de produtos do Supabase é inválido.");
        }
        return bucket;
    }

    private String requiredSupabaseValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(message);
        }
        return value.trim();
    }

    public static class Supabase {

        private String url;
        private String serviceRoleKey;
        private String bucket = "product-images";

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getServiceRoleKey() {
            return serviceRoleKey;
        }

        public void setServiceRoleKey(String serviceRoleKey) {
            this.serviceRoleKey = serviceRoleKey;
        }

        public String getBucket() {
            return bucket;
        }

        public void setBucket(String bucket) {
            this.bucket = bucket;
        }
    }
}
