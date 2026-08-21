package com.fabrinmarket.catalog.adapter.out.persistence;

import com.fabrinmarket.catalog.application.port.out.ProductRepositoryPort;
import com.fabrinmarket.catalog.domain.model.Product;
import com.fabrinmarket.catalog.domain.model.ProductDescription;
import com.fabrinmarket.catalog.domain.model.ProductName;
import com.fabrinmarket.catalog.domain.model.ProductPrice;
import com.fabrinmarket.catalog.domain.model.ProductStock;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
class ProductPersistenceAdapter implements ProductRepositoryPort {

    private final SpringDataProductRepository repository;

    ProductPersistenceAdapter(SpringDataProductRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Product save(Product product) {
        ProductJpaEntity entity;
        if (product.id() == null) {
            entity = new ProductJpaEntity(
                    null,
                    product.sellerId(),
                    product.name().value(),
                    product.description().value(),
                    product.price().value(),
                    product.stock().value(),
                    product.categoryId(),
                    product.imageUrl(),
                    product.createdAt()
            );
        } else {
            entity = repository.findById(product.id()).orElseThrow();
            entity.apply(
                    product.name().value(),
                    product.description().value(),
                    product.price().value(),
                    product.stock().value(),
                    product.categoryId(),
                    product.imageUrl()
            );
        }
        return toDomain(repository.saveAndFlush(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(Integer id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductSlice findPage(int page, int limit) {
        var pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "id"));
        var result = repository.findAll(pageable);
        return new ProductSlice(result.getContent().stream().map(this::toDomain).toList(), result.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findBySellerId(Integer sellerId) {
        return repository.findBySellerIdOrderByIdDesc(sellerId).stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        repository.deleteById(id);
        repository.flush();
    }

    private Product toDomain(ProductJpaEntity entity) {
        return new Product(
                entity.getId(),
                entity.getSellerId(),
                new ProductName(entity.getName()),
                new ProductDescription(entity.getDescription()),
                new ProductPrice(entity.getPrice()),
                new ProductStock(entity.getStock()),
                entity.getCategoryId(),
                entity.getImageUrl(),
                entity.getCreatedAt()
        );
    }
}
